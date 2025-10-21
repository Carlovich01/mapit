import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import * as d3 from "d3-hierarchy";
import "@xyflow/react/dist/style.css";
import FloatingEdge from "./FloatingEdge";
import FloatingConnectionLine from "./FloatingConnectionLine";

const edgeTypes = {
  floating: FloatingEdge,
};

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

  // Configure d3-hierarchy tree layout radial
  useEffect(() => {
    if (!nodes.length || !edges.length) return;

    // Build hierarchical structure from nodes and edges
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    
    // Find root node (level 0)
    const rootNode = nodes.find((n) => (n.data as any).level === 0);
    if (!rootNode) return;

    // Build tree structure
    const buildTree = (nodeId: string): any => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const childEdges = edges.filter((e) => e.source === nodeId);
      const children = childEdges
        .map((e) => buildTree(e.target))
        .filter(Boolean);

      return {
        id: nodeId,
        data: node.data,
        children: children.length > 0 ? children : undefined,
      };
    };

    const treeData = buildTree(rootNode.id);
    if (!treeData) return;

    // Create hierarchy
    const root = d3.hierarchy(treeData);

    // Calculate nodes per level to determine radius needed for each level
    const nodesPerLevel = new Map<number, number>();
    root.descendants().forEach((node) => {
      const depth = node.depth;
      nodesPerLevel.set(depth, (nodesPerLevel.get(depth) || 0) + 1);
    });

    // Calculate required radius based on tree depth and node count
    // d3.tree() optimiza el espacio mejor que cluster
    const maxNodesInLevel = Math.max(...Array.from(nodesPerLevel.values()));
    const nodeWidth = 180; // Aumentado de 160
    const minSpacing = 140; // Aumentado de 100
    
    // Calcular radio basado en el nivel con más nodos con factor de seguridad
    const safetyFactor = 1.6; // Factor de seguridad para distribucion no uniforme
    const requiredCircumference = maxNodesInLevel * (nodeWidth + minSpacing) * safetyFactor;
    const baseRadius = requiredCircumference / (2 * Math.PI);
    
    // Escalar el radio según la profundidad del árbol
    const radiusPerLevel = Math.max(250, baseRadius / Math.max(root.height, 1));
    const maxRadius = radiusPerLevel * root.height;

    // Configure radial tree layout (mejor para mapas mentales)
    const treeLayout = d3.tree<any>()
      .size([2 * Math.PI, maxRadius])
      .separation((a, b) => {
        // Separación agresiva para evitar solapamiento
        const baseSep = a.parent === b.parent ? 2 : 4; // Aumentado de 1:2 a 2:4
        // Ajustar separación según profundidad
        const depthFactor = 1 + (a.depth * 0.2); // Más espacio en niveles profundos
        return (baseSep / Math.max(a.depth, 1)) * depthFactor * 1.8; // Multiplicador adicional
      });

    // Apply layout
    treeLayout(root);

    // Convert polar coordinates to cartesian and update node positions
    const centerX = 600;
    const centerY = 500;

    const updatedNodes = nodes.map((node) => {
      const descendant = root.descendants().find((d: any) => d.data.id === node.id);
      if (descendant) {
        const angle = (descendant as any).x;
        const radius = (descendant as any).y;
        
        // Convert polar to cartesian
        const x = centerX + radius * Math.cos(angle - Math.PI / 2);
        const y = centerY + radius * Math.sin(angle - Math.PI / 2);

        return {
          ...node,
          position: { x, y },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  }, [initialNodes, initialEdges, setNodes]);

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
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        nodesDraggable={false}
        nodesConnectable={!readOnly || isGameMode}
        elementsSelectable={!readOnly || isGameMode}
        minZoom={0.1}
        maxZoom={4}
        fitView
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

