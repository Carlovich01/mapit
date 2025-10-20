import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import type { Connection } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import FloatingEdge from './FloatingEdge.tsx';
import FloatingConnectionLine from './FloatingConnectionLine.tsx';
import { initialElements } from './initialElements.ts';

const { nodes: initialNodes, edges: initialEdges } = initialElements();

const edgeTypes = {
  floating: FloatingEdge,
};

const NodeAsHandleFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'floating'
          },
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <div className="floating-edges">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
