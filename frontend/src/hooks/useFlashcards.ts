import { useState, useEffect } from "react";
import { Flashcard, FlashcardProgress } from "../types/flashcard";
import { flashcardService } from "../services/flashcardService";

export function useFlashcards(mindMapId?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mindMapId) {
      loadFlashcards();
    }
  }, [mindMapId]);

  const loadFlashcards = async () => {
    if (!mindMapId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await flashcardService.getFlashcardsForMindMap(mindMapId);
      setFlashcards(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error loading flashcards");
    } finally {
      setLoading(false);
    }
  };

  const reviewFlashcard = async (flashcardId: string, quality: number) => {
    try {
      const progress = await flashcardService.reviewFlashcard(
        flashcardId,
        quality
      );
      return progress;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.detail || "Error reviewing flashcard"
      );
    }
  };

  return {
    flashcards,
    loading,
    error,
    reviewFlashcard,
    reload: loadFlashcards,
  };
}

export function useDueFlashcards(mindMapId?: string) {
  const [dueFlashcards, setDueFlashcards] = useState<FlashcardProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDueFlashcards();
  }, [mindMapId]);

  const loadDueFlashcards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardService.getDueFlashcards(mindMapId);
      setDueFlashcards(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error loading due flashcards");
    } finally {
      setLoading(false);
    }
  };

  return {
    dueFlashcards,
    loading,
    error,
    reload: loadDueFlashcards,
  };
}
