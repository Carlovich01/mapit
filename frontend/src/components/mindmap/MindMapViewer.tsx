import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import * as d3 from "d3-force";
import "@xyflow/react/dist/style.css";
import FloatingEdge from "./FloatingEdge";
import FloatingConnectionLine from "./FloatingConnectionLine";

const edgeTypes = {
  floating: FloatingEdge,
};

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  radius: number;
}

interface MindMapViewerProps {
  nodes: Node[];
  edges: Edge[];
  isGameMode?: boolean;
  onEdgesChange?: (edges: Edge[]) => void;
  readOnly?: boolean;
}

function MindMapViewerInner({
  nodes: initialNodes,
  edges: initialEdges,
  isGameMode = false,
  onEdgesChange,
  readOnly = false,
}: MindMapViewerProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);
  const { fitView } = useReactFlow();
  const fitViewAppliedRef = useRef(false);

  // Update nodes and edges when props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly && !isGameMode) return;
      
      const newEdges = addEdge(
        {
          ...params,
          type: "floating",
        },
        edges
      );
      setEdges(newEdges);
      
      if (onEdgesChange) {
        onEdgesChange(newEdges);
      }
    },
    [edges, setEdges, readOnly, isGameMode, onEdgesChange]
  );

  // Configure d3-force simulation
  useEffect(() => {
    if (!nodes.length) return;

    // Reset fitView flag when nodes change
    fitViewAppliedRef.current = false;

    // Create simulation nodes with radius
    const simulationNodes: SimulationNode[] = nodes.map((node) => {
      const rfNode = node as Node;
      return {
        id: node.id,
        x: node.position?.x ?? Math.random() * 800,
        y: node.position?.y ?? Math.random() * 600,
        radius: rfNode.measured?.width ? rfNode.measured.width / 2 + 10 : 60,
      };
    });

    const simulationLinks = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));

    // Create simulation with optimized forces
    const simulation = d3
      .forceSimulation<SimulationNode>(simulationNodes)
      .force(
        "link",
        d3
          .forceLink(simulationLinks)
          .id((d: any) => d.id)
          .distance(250)
          .strength(0.7)
      )
      .force("charge", d3.forceManyBody().strength(-1500))
      .force("center", d3.forceCenter(400, 300))
      .force(
        "collision",
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => d.radius)
          .strength(1)
          .iterations(4)
      )
      .alphaDecay(0.015)
      .velocityDecay(0.5);

    let tickCount = 0;

    // Update positions on each tick
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

      // Apply fitView after simulation has stabilized
      tickCount++;
      if (tickCount > 50 && !fitViewAppliedRef.current) {
        fitViewAppliedRef.current = true;
        setTimeout(() => {
          fitView({ padding: 0.2, duration: 400 });
        }, 100);
      }
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [edges, setNodes, fitView]);

  // Handle node drag with d3-force
  const onNodeDragStart: NodeMouseHandler = useCallback(() => {
    if (simulationRef.current) {
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
      simulationRef.current.alpha(0.5).restart();
    }
  }, []);

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        // Get updated edges after changes
        setEdges((eds) => {
          onEdgesChange(eds);
          return eds;
        });
      }
    },
    [onEdgesChangeInternal, onEdgesChange, setEdges]
  );

  return (
    <div className="floating-edges w-full" style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        nodesDraggable={!readOnly || isGameMode}
        nodesConnectable={!readOnly || isGameMode}
        elementsSelectable={!readOnly || isGameMode}
        minZoom={0.1}
        maxZoom={4}
      >
        <Background />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function MindMapViewer(props: MindMapViewerProps) {
  return (
    <ReactFlowProvider>
      <MindMapViewerInner {...props} />
    </ReactFlowProvider>
  );
}

