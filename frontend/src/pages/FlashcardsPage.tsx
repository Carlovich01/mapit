import { useParams, Link } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { useFlashcards } from '../hooks/useFlashcards';
import { FlashcardDeck } from '../components/flashcards/FlashcardDeck';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export function FlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const { mindMap, loading: mindMapLoading } = useMindMap(id);
  const { flashcards, loading, error, reviewFlashcard, reload } = useFlashcards(id);

  const handleReview = async (flashcardId: string, quality: number) => {
    await reviewFlashcard(flashcardId, quality);
    reload();
  };

  if (mindMapLoading || loading) {
    return <div>Cargando flashcards...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          {mindMap && (
            <p className="text-sm text-muted-foreground">
              Mapa: {mindMap.title}
            </p>
          )}
        </div>
        <Link to={`/mind-maps/${id}`}>
          <Button variant="outline">Ver Mapa Mental</Button>
        </Link>
      </div>

      {flashcards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No hay flashcards disponibles para este mapa mental.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Total de flashcards: {flashcards.length}
          </div>
          <FlashcardDeck flashcards={flashcards} onReview={handleReview} />
        </>
      )}
    </div>
  );
}

