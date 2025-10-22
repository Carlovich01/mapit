import { useParams, useNavigate } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { useDueFlashcards } from '../hooks/useFlashcards';
import { FlashcardDeck } from '../components/flashcards/FlashcardDeck';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import LogoMapit from '../assets/LogoMapit.svg';

export function FlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mindMap, loading: mindMapLoading } = useMindMap(id);
  const { dueFlashcards, loading, error, reload } = useDueFlashcards(id);

  const handleReview = async (flashcardId: string, quality: number) => {
    const { flashcardService } = await import('../services/flashcardService');
    await flashcardService.reviewFlashcard(flashcardId, quality);
    // Recargar las flashcards vencidas después de cada revisión
    await reload();
  };

  if (mindMapLoading || loading) {
    return <div className="flex items-center justify-center h-screen">Cargando flashcards...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-destructive">{error}</div>;
  }

  // Extraer solo las flashcards de los objetos de progreso
  const flashcardsToReview = dueFlashcards.map(progress => progress.flashcard);

  return (
    <div className="h-screen flex flex-col">
      {/* Header personalizado */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src={LogoMapit} 
                alt="MapIT Logo" 
                className="h-10 w-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => navigate('/dashboard')}
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold truncate">Flashcards para Revisar</h1>
                {mindMap && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    Mapa: {mindMap.title}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido que ocupa todo el espacio restante */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {flashcardsToReview.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-lg font-semibold">¡Al día con tus revisiones!</h3>
                <p className="text-muted-foreground">
                  No hay flashcards pendientes de revisar en este momento.
                </p>
                <p className="text-sm text-muted-foreground">
                  Vuelve más tarde cuando tus flashcards estén listas para una nueva revisión.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="mt-4"
                >
                  Volver al Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <FlashcardDeck flashcards={flashcardsToReview} onReview={handleReview} />
          )}
        </div>
      </div>
    </div>
  );
}

