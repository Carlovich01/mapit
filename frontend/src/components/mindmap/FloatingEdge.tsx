import { getBezierPath, useInternalNode } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { getEdgeParams } from '../../utils/edgeUtils';
import { getColorForLevel } from '../../utils/nodeStyles';

interface FloatingEdgeProps {
  id: string;
  source: string;
  target: string;
  style?: CSSProperties;
}

function FloatingEdge({ id, source, target, style }: FloatingEdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode || 
      !sourceNode.measured?.width || !sourceNode.measured?.height ||
      !targetNode.measured?.width || !targetNode.measured?.height) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode as any,
    targetNode as any,
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  // Get color based on source node level
  const sourceLevel = (sourceNode.data as any)?.level ?? 0;
  const edgeColor = getColorForLevel(sourceLevel);
  
  // Use custom marker with matching color
  const markerLevel = sourceLevel % 8; // Cycle through 8 defined markers
  const customMarkerEnd = `url(#arrow-${markerLevel})`;

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={customMarkerEnd}
      style={{
        ...style,
        stroke: edgeColor.border,
        strokeWidth: 2,
        opacity: 0.7,
      }}
    />
  );
}

export default FloatingEdge;

