import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import FloatingEdge from "./FloatingEdge";
import FloatingConnectionLine from "./FloatingConnectionLine";

const edgeTypes = {
  floating: FloatingEdge,
};

interface MindMapGameViewerProps {
  nodes: Node[];
  edges: Edge[];
  onEdgesChange?: (edges: Edge[]) => void;
}

function MindMapGameViewerInner({
  nodes: initialNodes,
  edges: initialEdges,
  onEdgesChange,
}: MindMapGameViewerProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  // Actualizar nodos y bordes cuando cambian los accesorios
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
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
    [edges, setEdges, onEdgesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        // Obtener bordes actualizados después de los cambios
        setEdges((eds) => {
          onEdgesChange(eds);
          return eds;
        });
      }
    },
    [onEdgesChangeInternal, onEdgesChange, setEdges]
  );

  const proOptions = { hideAttribution: true };

  return (
    <div className="floating-edges game-mode w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        edgesFocusable={true}
        minZoom={0.1}
        maxZoom={4}
        connectionRadius={360}
        connectOnClick={true}
        fitView
        proOptions={proOptions}
      >
        <Background />
        <Controls showInteractive={false} />
        {/* <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
          }}
        /> */}
      </ReactFlow>
    </div>
  );
}

export function MindMapGameViewer(props: MindMapGameViewerProps) {
  return (
    <ReactFlowProvider>
      <MindMapGameViewerInner {...props} />
    </ReactFlowProvider>
  );
}

