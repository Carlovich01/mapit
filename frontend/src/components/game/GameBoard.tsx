import { useState, useEffect, useCallback } from 'react';
import { type Edge } from '@xyflow/react';
import type { MindMap } from '../../types/mindmap';
import { MindMapViewer } from '../mindmap/MindMapViewer';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface GameBoardProps {
  mindMap: MindMap;
  onComplete: (edges: Array<{ source: string; target: string }>, timeElapsed: number) => void;
}

export function GameBoard({ mindMap, onComplete }: GameBoardProps) {
  const [gameEdges, setGameEdges] = useState<Edge[]>([]);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Shuffle nodes for game mode
  const shuffledNodes = mindMap.nodes.map((node) => ({
    ...node,
    data: { label: node.label },
    position: {
      x: Math.random() * 800,
      y: Math.random() * 600,
    },
  }));

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Juego de Reordenamiento</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold">Tiempo:</span> {formatTime(elapsedTime)}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Conexiones:</span> {gameEdges.length} / {mindMap.edges.length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Instrucciones:</strong> Arrastra y conecta los nodos para recrear el mapa mental original.
              Conecta los nodos haciendo clic y arrastrando desde un nodo hacia otro.
            </p>
          </div>

          <MindMapViewer
            nodes={shuffledNodes}
            edges={gameEdges}
            isGameMode={true}
            onEdgesChange={handleEdgesChange}
          />

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSubmit}
              size="lg"
              disabled={gameEdges.length === 0}
            >
              Enviar Respuesta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

