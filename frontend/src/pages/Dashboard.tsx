import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMindMaps } from '../hooks/useMindMap';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { mindMapService } from '../services/mindMapService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Dashboard() {
  const { mindMaps, loading, error, reload } = useMindMaps();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      await mindMapService.uploadPDF(file);
      reload();
      e.target.value = '';
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Error al subir PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Subir Nuevo PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
            {uploadError && (
              <div className="text-sm text-destructive">{uploadError}</div>
            )}
            {uploading && (
              <div className="text-sm text-muted-foreground">
                Procesando PDF con IA...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Tus Mapas Mentales</h2>
        
        {loading && <p>Cargando...</p>}
        {error && <p className="text-destructive">{error}</p>}
        
        {!loading && mindMaps.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No tienes mapas mentales aún. ¡Sube tu primer PDF!
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mindMaps.map((mindMap) => (
            <Card key={mindMap.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-lg">{mindMap.title}</CardTitle>
                <CardDescription>
                  {mindMap.pdf_filename}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-xs text-muted-foreground mb-4">
                  Creado: {format(new Date(mindMap.created_at), 'dd/MM/yyyy', { locale: es })}
                </p>
                <div className="flex gap-2 mt-auto">
                  <Link to={`/mind-maps/${mindMap.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Ver Mapa
                    </Button>
                  </Link>
                  <Link to={`/flashcards/${mindMap.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Flashcards
                    </Button>
                  </Link>
                  <Link to={`/game/${mindMap.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Jugar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

