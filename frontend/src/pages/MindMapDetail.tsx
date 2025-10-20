import { useParams, Link } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { MindMapViewer } from '../components/mindmap/MindMapViewer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function MindMapDetail() {
  const { id } = useParams<{ id: string }>();
  const { mindMap, loading, error } = useMindMap(id);

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
    data: { label: node.label },
    position: node.position || { x: 0, y: 0 },
  }));

  const edges = mindMap.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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

      <Card>
        <CardHeader>
          <CardTitle>Mapa Mental Interactivo</CardTitle>
        </CardHeader>
        <CardContent>
          <MindMapViewer nodes={nodes} edges={edges} readOnly={true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nodos del Mapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mindMap.nodes.map((node) => (
              <div
                key={node.id}
                className="p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <h4 className="font-semibold">{node.label}</h4>
                {node.content && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {node.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

