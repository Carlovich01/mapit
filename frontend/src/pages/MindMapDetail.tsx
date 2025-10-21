import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { MindMapReadViewer } from '../components/mindmap/MindMapReadViewer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getNodeStyleForLevel, getColorForLevel } from '../utils/nodeStyles';

export function MindMapDetail() {
  const { id } = useParams<{ id: string }>();
  const { mindMap, loading, error } = useMindMap(id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (loading) {
    return <div>Cargando mapa mental...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (!mindMap) {
    return <div>Mapa mental no encontrado</div>;
  }

  const nodes = mindMap.nodes.map((node) => ({
    id: node.id,
    data: { 
      label: node.label,
      level: node.level,
      content: node.content,
    },
    position: node.position || { x: 0, y: 0 },
    style: getNodeStyleForLevel(node.level),
  }));

  const edges = mindMap.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
  }));

  const selectedNode = selectedNodeId 
    ? mindMap.nodes.find(n => n.id === selectedNodeId)
    : null;

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-3xl font-bold">{mindMap.title}</h1>
          {mindMap.pdf_filename && (
            <p className="text-sm text-muted-foreground">
              Fuente: {mindMap.pdf_filename}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/flashcards/${mindMap.id}`}>
            <Button variant="outline">Ver Flashcards</Button>
          </Link>
          <Link to={`/game/${mindMap.id}`}>
            <Button>Jugar</Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Card className="w-full">
          <CardHeader className="px-4 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Niveles:</span>
                {Array.from(new Set(mindMap.nodes.map(n => n.level))).sort((a, b) => a - b).map(level => {
                  const color = getColorForLevel(level);
                  return (
                    <div 
                      key={level}
                      className="flex items-center gap-1 px-2 py-1 rounded"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      <span className="font-semibold">{level + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MindMapReadViewer nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
          </CardContent>
        </Card>

        {/* Card flotante sobre el mapa para mostrar contenido del nodo */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-10 w-80 md:w-96 max-h-[calc(100%-2rem)] overflow-y-auto">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Detalles del Nodo</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNodeId(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="px-2 py-1 text-xs font-semibold rounded"
                      style={{ 
                        backgroundColor: getColorForLevel(selectedNode.level).bg, 
                        color: getColorForLevel(selectedNode.level).text 
                      }}
                    >
                      Nivel {selectedNode.level + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{selectedNode.label}</h3>
                  {selectedNode.content ? (
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {selectedNode.content}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Este nodo no tiene contenido adicional.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

