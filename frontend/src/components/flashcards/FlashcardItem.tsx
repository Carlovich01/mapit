import { useState } from "react";
import type { Flashcard, AIEvaluationResponse } from "../../types/flashcard";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { flashcardService } from "../../services/flashcardService";

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
  const [mode, setMode] = useState<"manual" | "written">("manual");
  const [userAnswer, setUserAnswer] = useState("");
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluationResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

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
    resetCard();
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    try {
      const evaluation = await flashcardService.evaluateAnswer(
        flashcard.id,
        userAnswer
      );
      setAiEvaluation(evaluation);
      setShowAnswer(true);
    } catch (error) {
      console.error("Error al evaluar la respuesta:", error);
      alert("Error al evaluar la respuesta. Por favor intenta de nuevo.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAIReview = async () => {
    if (aiEvaluation) {
      await onReview(aiEvaluation.quality);
      resetCard();
    }
  };

  const resetCard = () => {
    setShowAnswer(false);
    setMode("manual");
    setUserAnswer("");
    setAiEvaluation(null);
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
          <div className="space-y-4">
            {/* Selector de modo */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setMode("manual")}
                variant={mode === "manual" ? "default" : "outline"}
                className="flex-1"
                disabled={disabled}
              >
                Evaluación Manual
              </Button>
              <Button
                onClick={() => setMode("written")}
                variant={mode === "written" ? "default" : "outline"}
                className="flex-1"
                disabled={disabled}
              >
                Escribir Respuesta
              </Button>
            </div>

            {/* Modo manual */}
            {mode === "manual" && (
              <Button
                onClick={() => setShowAnswer(true)}
                className="w-full"
                disabled={disabled}
              >
                Mostrar Respuesta
              </Button>
            )}

            {/* Modo escrito */}
            {mode === "written" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Escribe tu respuesta:
                </label>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Escribe aquí tu respuesta..."
                  disabled={disabled || isEvaluating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      e.preventDefault();
                      handleSubmitAnswer();
                    }
                  }}
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleSubmitAnswer}
                  className="w-full"
                  disabled={disabled || isEvaluating || !userAnswer.trim()}
                >
                  {isEvaluating ? "Evaluando..." : "Evaluar Respuesta"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 bg-brand-light dark:bg-brand-blue-darkest rounded-lg border-2 border-primary">
              <p className="text-sm font-semibold mb-2 text-primary">
                Respuesta:
              </p>
              <p className="text-base">{flashcard.answer}</p>
            </div>

            {/* Mostrar evaluación de IA si existe */}
            {aiEvaluation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      qualityOptions.find((q) => q.value === aiEvaluation.quality)
                        ?.color || "bg-gray-500"
                    }`}
                  />
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Evaluación IA: {aiEvaluation.quality_label}
                  </p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {aiEvaluation.feedback}
                </p>
              </div>
            )}

            <div>
              {aiEvaluation ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    ¿Aceptar evaluación de IA o calificar manualmente?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAIReview}
                      className="flex-1"
                      disabled={disabled}
                    >
                      Aceptar ({aiEvaluation.quality_label})
                    </Button>
                    <Button
                      onClick={() => setAiEvaluation(null)}
                      variant="outline"
                      className="flex-1"
                      disabled={disabled}
                    >
                      Calificar Manualmente
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
