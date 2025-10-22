import { useState, useEffect, useCallback, useMemo } from 'react';
import { type Edge } from '@xyflow/react';
import type { MindMap } from '../../types/mindmap';
import { MindMapGameViewer } from '../mindmap/MindMapGameViewer';
import { Button } from '../ui/button';
import { getNodeStyleForLevel } from '../../utils/nodeStyles';

interface GameBoardProps {
  mindMap: MindMap;
  onComplete: (edges: Array<{ source: string; target: string }>, timeElapsed: number) => void;
}

export function GameBoard({ mindMap, onComplete }: GameBoardProps) {
  const [gameEdges, setGameEdges] = useState<Edge[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  // Generate random positions once for nodes in game mode
  const shuffledNodes = useMemo(() => {
    const generateRandomPosition = () => {
      // Distribute nodes randomly in a large area
      const centerX = 600;
      const centerY = 400;
      const spreadRadius = 400;
      
      // Use a random angle and radius for each node
      const angle = (Math.random() * 2 * Math.PI);
      const radius = Math.random() * spreadRadius;
      
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    };

    return mindMap.nodes.map((node) => ({
      ...node,
      data: { 
        label: node.label,
        level: node.level,
        content: node.content,
      },
      position: generateRandomPosition(),
      style: getNodeStyleForLevel(node.level),
    }));
  }, [mindMap.nodes, resetKey]);

  // Update elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleEdgesChange = useCallback((edges: Edge[]) => {
    setGameEdges(edges);
  }, []);

  const handleReset = () => {
    setGameEdges([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setResetKey((prev) => prev + 1);
  };

  const handleSubmit = () => {
    const submittedEdges = gameEdges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));
    
    const timeInSeconds = Math.floor((Date.now() - startTime) / 1000);
    onComplete(submittedEdges, timeInSeconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Barra de información y controles */}
      <div className="border-b bg-white px-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold">Tiempo:</span> {formatTime(elapsedTime)}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Conexiones:</span> {gameEdges.length} / {mindMap.edges.length}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              size="sm"
              variant="outline"
            >
              Reiniciar
            </Button>
            <Button
              onClick={handleSubmit}
              size="sm"
              disabled={gameEdges.length === 0}
            >
              Enviar
            </Button>
          </div>
        </div>
      </div>



      {/* Área de juego que ocupa todo el espacio restante */}
      <div className="flex-1 relative">
        <MindMapGameViewer
          nodes={shuffledNodes}
          edges={gameEdges}
          onEdgesChange={handleEdgesChange}
        />
      </div>
    </div>
  );
}

