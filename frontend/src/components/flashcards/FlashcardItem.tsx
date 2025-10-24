import { useState } from "react";
import type { Flashcard } from "../../types/flashcard";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface FlashcardItemProps {
  flashcard: Flashcard;
  onReview: (quality: number) => Promise<void>;
  disabled?: boolean;
  currentIndex?: number;
  totalCards?: number;
}

export function FlashcardItem({
  flashcard,
  onReview,
  disabled,
  currentIndex,
  totalCards,
}: FlashcardItemProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const qualityOptions = [
    { value: 5, label: "Perfecto", color: "bg-green-500" },
    { value: 4, label: "Bien", color: "bg-brand-blue" },
    { value: 3, label: "Correcto", color: "bg-yellow-500" },
    { value: 2, label: "Difícil", color: "bg-orange-500" },
    { value: 1, label: "Mal", color: "bg-red-500" },
    { value: 0, label: "No recuerdo", color: "bg-gray-500" },
  ];

  const handleReview = async (quality: number) => {
    await onReview(quality);
  };

  return (
    <Card className="bg-gradient-to-r from-primary to-[#3b82f6] border-primary shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>

            <CardTitle className="text-2xl text-white font-bold">
              {totalCards !== undefined && currentIndex !== undefined
                ? `Flashcard ${currentIndex + 1} de ${totalCards}`
                : "Pregunta"}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 bg-white rounded-b-xl pt-6">
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
            <div className="p-4 bg-brand-light dark:bg-brand-blue-darkest rounded-lg border-2 border-primary">
              <p className="text-sm font-semibold mb-2 text-primary">
                Respuesta:
              </p>
              <p className="text-base">{flashcard.answer}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">
                ¿Qué tan bien recordaste?
              </p>
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
