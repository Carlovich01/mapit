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

  // Configure d3-hierarchy cluster layout radial
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

    // Calculate required radius for each level to avoid overlap
    const nodeWidth = 150; // Ancho estimado del nodo
    const minSpacing = 80; // Espaciado mínimo entre nodos (aumentado)
    const minLevelStep = 220; // Distancia mínima entre niveles consecutivos
    
    // Calculate radius for each level based on its node count
    const levelRadii = new Map<number, number>();
    levelRadii.set(0, 0); // Root at center
    
    for (let level = 1; level <= root.height; level++) {
      const nodesInLevel = nodesPerLevel.get(level) || 0;
      const prevRadius = levelRadii.get(level - 1) || 0;
      
      if (nodesInLevel > 0) {
        // Calculate minimum circumference for this level
        // C = n * (width + spacing)
        const requiredCircumference = nodesInLevel * (nodeWidth + minSpacing);
        
        // Calculate minimum radius from circumference: r = C / (2π)
        const minRadiusForCircumference = requiredCircumference / (2 * Math.PI);
        
        // Ensure minimum distance from previous level
        const minRadiusFromPrev = prevRadius + minLevelStep;
        
        // Use the larger of both constraints
        const radius = Math.max(minRadiusForCircumference, minRadiusFromPrev);
        levelRadii.set(level, radius);
      } else {
        // No nodes at this level, maintain minimum spacing
        levelRadii.set(level, prevRadius + minLevelStep);
      }
    }
    
    // Get the maximum radius (outermost level)
    const maxRadius = levelRadii.get(root.height) || 400;

    // Configure radial cluster layout
    const clusterLayout = d3.cluster<any>()
      .size([2 * Math.PI, maxRadius])
      .separation((a, b) => {
        // Siblings closer than non-siblings
        return a.parent === b.parent ? 1 : 2;
      });

    // Apply layout
    clusterLayout(root);
    
    // Adjust radii to match our calculated level radii
    root.descendants().forEach((node: any) => {
      const customRadius = levelRadii.get(node.depth) || 0;
      node.y = customRadius;
    });

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

