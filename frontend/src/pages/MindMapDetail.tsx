import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { MindMapReadViewer } from '../components/mindmap/MindMapReadViewer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getNodeStyleForLevel, getColorForLevel } from '../utils/nodeStyles';

export function MindMapDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mindMap, loading, error } = useMindMap(id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando mapa mental...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-destructive">{error}</div>;
  }

  if (!mindMap) {
    return <div className="flex items-center justify-center h-screen">Mapa mental no encontrado</div>;
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
    <div className="h-screen flex flex-col">
      {/* Header personalizado sticky */}
      <div className="border-b bg-background sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {/* Fila superior: Flecha + Título + Fuente */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex-shrink-0"
              >
                ← Volver
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold truncate">{mindMap.title}</h1>
                {mindMap.pdf_filename && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    Fuente: {mindMap.pdf_filename}
                  </p>
                )}
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2 flex-shrink-0">
              <Link to={`/flashcards/${mindMap.id}`}>
                <Button variant="outline" size="sm">Flashcards</Button>
              </Link>
              <Link to={`/game/${mindMap.id}`}>
                <Button size="sm">Jugar</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del mapa que ocupa todo el espacio restante */}
      <div className="flex-1 relative overflow-hidden">
        <MindMapReadViewer nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />

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

