import { useParams, Link } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { MindMapReadViewer } from '../components/mindmap/MindMapReadViewer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getNodeStyleForLevel, getColorForLevel } from '../utils/nodeStyles';

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
          <MindMapReadViewer nodes={nodes} edges={edges} />
        </CardContent>
      </Card>

      <div className="px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Nodos del Mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mindMap.nodes.map((node) => {
                const levelColor = getColorForLevel(node.level);
                return (
                  <div
                    key={node.id}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors"
                    style={{ borderLeftWidth: '4px', borderLeftColor: levelColor.bg }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-1 text-xs font-semibold rounded"
                        style={{ 
                          backgroundColor: levelColor.bg, 
                          color: levelColor.text 
                        }}
                      >
                        Nivel {node.level + 1}
                      </span>
                      <h4 className="font-semibold">{node.label}</h4>
                    </div>
                    {node.content && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {node.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

