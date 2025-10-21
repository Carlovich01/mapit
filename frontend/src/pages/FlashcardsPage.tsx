import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { useDueFlashcards } from '../hooks/useFlashcards';
import { FlashcardDeck } from '../components/flashcards/FlashcardDeck';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

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
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
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
              <CardContent className="p-8 text-center space-y-2">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-lg font-semibold">¡Al día con tus revisiones!</h3>
                <p className="text-muted-foreground">
                  No hay flashcards pendientes de revisar en este momento.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Vuelve más tarde cuando tus flashcards estén listas para una nueva revisión.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        {flashcardsToReview.length} flashcard{flashcardsToReview.length !== 1 ? 's' : ''} vencida{flashcardsToReview.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Es momento de repasar para mantener tu memoria fresca
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <FlashcardDeck flashcards={flashcardsToReview} onReview={handleReview} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

