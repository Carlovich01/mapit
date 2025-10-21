import { useState } from 'react';
import type { Flashcard } from '../../types/flashcard';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface FlashcardItemProps {
  flashcard: Flashcard;
  onReview: (quality: number) => Promise<void>;
  disabled?: boolean;
}

export function FlashcardItem({ flashcard, onReview, disabled }: FlashcardItemProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const qualityOptions = [
    { value: 5, label: 'Perfecto', color: 'bg-green-500' },
    { value: 4, label: 'Bien', color: 'bg-blue-500' },
    { value: 3, label: 'Correcto', color: 'bg-yellow-500' },
    { value: 2, label: 'Difícil', color: 'bg-orange-500' },
    { value: 1, label: 'Mal', color: 'bg-red-500' },
    { value: 0, label: 'No recuerdo', color: 'bg-gray-500' },
  ];

  const handleReview = async (quality: number) => {
    await onReview(quality);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pregunta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-base">{flashcard.question}</p>
        </div>

        {!showAnswer ? (
          <Button
            onClick={() => setShowAnswer(true)}
            className="w-full"
            disabled={disabled}
          >
            Mostrar Respuesta
          </Button>
        ) : (
          <>
            <div className="p-4 bg-accent rounded-lg border-2 border-primary">
              <p className="text-sm font-semibold mb-2 text-muted-foreground">Respuesta:</p>
              <p className="text-base">{flashcard.answer}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">¿Qué tan bien recordaste?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {qualityOptions.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => handleReview(option.value)}
                    variant="outline"
                    className="h-auto py-3"
                    disabled={disabled}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span className="text-xs">{option.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

