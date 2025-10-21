import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMindMaps } from '../hooks/useMindMap';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { mindMapService } from '../services/mindMapService';
import { flashcardService } from '../services/flashcardService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Dashboard() {
  const { mindMaps, loading, error, reload } = useMindMaps();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dueFlashcardCounts, setDueFlashcardCounts] = useState<Record<string, number>>({});

  // Cargar el conteo de flashcards vencidas para cada mapa mental
  useEffect(() => {
    const loadDueFlashcardCounts = async () => {
      if (mindMaps.length === 0) return;
      
      const counts: Record<string, number> = {};
      
      await Promise.all(
        mindMaps.map(async (mindMap) => {
          try {
            const dueFlashcards = await flashcardService.getDueFlashcards(mindMap.id);
            counts[mindMap.id] = dueFlashcards.length;
          } catch (err) {
            counts[mindMap.id] = 0;
          }
        })
      );
      
      setDueFlashcardCounts(counts);
    };
    
    loadDueFlashcardCounts();
  }, [mindMaps]);

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
    <div className="container mx-auto px-4 space-y-8">
      <div className="space-y-3">
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <Button 
          onClick={() => document.getElementById('pdf-upload')?.click()}
          disabled={uploading}
          size="lg"
          className="w-full sm:w-auto"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando PDF con IA...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subir Nuevo PDF
            </>
          )}
        </Button>
        {uploadError && (
          <div className="text-sm text-destructive">{uploadError}</div>
        )}
      </div>

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
          {mindMaps.map((mindMap) => {
            const dueCount = dueFlashcardCounts[mindMap.id] || 0;
            
            return (
              <Card key={mindMap.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mindMap.title}</CardTitle>
                      <CardDescription>
                        {mindMap.pdf_filename}
                      </CardDescription>
                    </div>
                    {dueCount > 0 ? (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                          {dueCount}
                        </span>
                      </div>
                    ) : dueFlashcardCounts[mindMap.id] !== undefined && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-green-600 dark:text-green-400">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground">
                      Creado: {format(new Date(new Date(mindMap.created_at).getTime() - 3 * 60 * 60 * 1000), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                    {dueCount > 0 ? (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                        📚 {dueCount} flashcard{dueCount !== 1 ? 's' : ''} para revisar
                      </p>
                    ) : dueFlashcardCounts[mindMap.id] !== undefined && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        ✅ Al día con las flashcards
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Link to={`/mind-maps/${mindMap.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Mapa
                      </Button>
                    </Link>
                    <Link to={`/flashcards/${mindMap.id}`} className="flex-1">
                      <Button 
                        variant={dueCount > 0 ? "default" : "outline"} 
                        className="w-full relative" 
                        size="sm"
                      >
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

