import { useState } from 'react';
import { Flashcard } from '../../types/flashcard';
import { FlashcardItem } from './FlashcardItem';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  onReview: (flashcardId: string, quality: number) => Promise<void>;
}

export function FlashcardDeck({ flashcards, onReview }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No hay flashcards disponibles para revisar.
        </CardContent>
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = `${currentIndex + 1} / ${flashcards.length}`;

  const handleReview = async (quality: number) => {
    setReviewing(true);
    try {
      await onReview(currentCard.id, quality);
      
      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Progreso: {progress}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0 || reviewing}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1))}
            disabled={currentIndex === flashcards.length - 1 || reviewing}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <FlashcardItem
        flashcard={currentCard}
        onReview={handleReview}
        disabled={reviewing}
      />
    </div>
  );
}

