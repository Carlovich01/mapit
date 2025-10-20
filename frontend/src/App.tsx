import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
} from "@xyflow/react";
import type { NodeMouseHandler } from "@xyflow/react";
import * as d3 from "d3-force";

import "@xyflow/react/dist/style.css";

import FloatingEdge from "./FloatingEdge";
import FloatingConnectionLine from "./FloatingConnectionLine";
import { initialElements } from "./initialElements";

const { nodes: initialNodes, edges: initialEdges } = initialElements();

const edgeTypes = {
  floating: FloatingEdge,
};

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  radius: number;
}

const NodeAsHandleFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
          },
          eds
        )
      ),
    [setEdges]
  );

  // Configurar la simulación de d3-force
  useEffect(() => {
    if (!nodes.length) return;

    // Crear datos para la simulación con radio de nodo
    const simulationNodes: SimulationNode[] = nodes.map((node) => {
      const rfNode = node as Node;
      return {
        id: node.id,
        x: node.position?.x ?? Math.random() * 800,
        y: node.position?.y ?? Math.random() * 600,
        // Radio basado en el tamaño del nodo (ajustable según tus nodos)
        radius: rfNode.measured?.width ? rfNode.measured.width / 2 + 10 : 60, // 10px de padding
      };
    });

    const simulationLinks = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));

    // Crear la simulación con fuerzas optimizadas para evitar superposición
    const simulation = d3
      .forceSimulation<SimulationNode>(simulationNodes)
      .force(
        "link",
        d3
          .forceLink(simulationLinks)
          .id((d: any) => d.id)
          .distance(250) // Distancia mayor entre nodos conectados
          .strength(0.7) // Fuerza de enlace más fuerte
      )
      .force("charge", d3.forceManyBody().strength(-1500)) // Repulsión más fuerte
      .force("center", d3.forceCenter(400, 300))
      .force(
        "collision",
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => d.radius) // Radio dinámico por nodo
          .strength(1) // Fuerza máxima de colisión (1 = 100%)
          .iterations(4) // Múltiples iteraciones para mejor precisión
      )
      .alphaDecay(0.015) // Decaimiento más lento para mejor convergencia
      .velocityDecay(0.5); // Mayor fricción para estabilizar

    // Actualizar posiciones en cada tick
    simulation.on("tick", () => {
      setNodes((nds) =>
        nds.map((node) => {
          const simNode = simulationNodes.find((n) => n.id === node.id);
          if (simNode && simNode.x !== undefined && simNode.y !== undefined) {
            return {
              ...node,
              position: {
                x: simNode.x,
                y: simNode.y,
              },
            };
          }
          return node;
        })
      );
    });

    simulationRef.current = simulation;

    // Limpiar la simulación al desmontar
    return () => {
      simulation.stop();
    };
  }, [edges, setNodes]); // Re-ejecutar cuando cambien los edges

  // Manejar el drag de nodos con d3-force
  const onNodeDragStart: NodeMouseHandler = useCallback(() => {
    if (simulationRef.current) {
      // Aumentar alpha para reactivar la simulación con más fuerza
      simulationRef.current.alphaTarget(0.5).restart();
    }
  }, []);

  const onNodeDrag: NodeMouseHandler = useCallback((_event, node) => {
    if (simulationRef.current) {
      const simNode = simulationRef.current
        .nodes()
        .find((n) => n.id === node.id);
      if (simNode) {
        simNode.fx = node.position.x;
        simNode.fy = node.position.y;
        // Forzar un tick adicional para actualizar colisiones inmediatamente
        simulationRef.current.alpha(
          Math.max(simulationRef.current.alpha(), 0.3)
        );
      }
    }
  }, []);

  const onNodeDragStop: NodeMouseHandler = useCallback((_event, node) => {
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0);
      const simNode = simulationRef.current
        .nodes()
        .find((n) => n.id === node.id);
      if (simNode) {
        simNode.fx = null;
        simNode.fy = null;
      }
      // Mantener la simulación activa un poco más para resolver colisiones
      simulationRef.current.alpha(0.5).restart();
    }
  }, []);

  return (
    <div className="floating-edges">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        fitView
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default NodeAsHandleFlow;
