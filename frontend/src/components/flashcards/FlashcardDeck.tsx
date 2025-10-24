import {useNavigate } from 'react-router-dom';
import { useState } from "react";
import type { Flashcard } from "../../types/flashcard";
import { FlashcardItem } from "./FlashcardItem";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  onReview: (flashcardId: string, quality: number) => Promise<void>;
}

export function FlashcardDeck({ flashcards, onReview }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No hay flashcards disponibles para revisar.
        </CardContent>
      </Card>
    );
  }

  // Mostrar pantalla de completado
  if (completed) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h3 className="text-2xl font-bold">¡Excelente trabajo!</h3>
          <p className="text-muted-foreground">
            Has completado todas las flashcards de esta sesión.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Volver al Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleReview = async (quality: number) => {
    setReviewing(true);
    try {
      await onReview(currentCard.id, quality);

      // Pasar a la siguiente tarjeta o completar
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Error al revisar la flashcard:", error);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <FlashcardItem
      key={currentCard.id}
      flashcard={currentCard}
      onReview={handleReview}
      disabled={reviewing}
      currentIndex={currentIndex}
      totalCards={flashcards.length}
    />
  );
}
