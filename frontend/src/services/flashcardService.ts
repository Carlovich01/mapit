import api from "./api";
import type {
  Flashcard,
  FlashcardProgress,
  FlashcardReview,
} from "../types/flashcard";

export const flashcardService = {
  async getFlashcardsForMindMap(mindMapId: string): Promise<Flashcard[]> {
    const response = await api.get<Flashcard[]>(
      `/flashcards/mind-maps/${mindMapId}/flashcards`
    );
    return response.data;
  },

  async reviewFlashcard(
    flashcardId: string,
    quality: number
  ): Promise<FlashcardProgress> {
    const review: FlashcardReview = { quality };
    const response = await api.post<FlashcardProgress>(
      `/flashcards/${flashcardId}/review`,
      review
    );
    return response.data;
  },

  async getDueFlashcards(mindMapId?: string): Promise<FlashcardProgress[]> {
    const response = await api.get<FlashcardProgress[]>("/flashcards/due", {
      params: mindMapId ? { mind_map_id: mindMapId } : {},
    });
    return response.data;
  },

  async getFlashcardProgress(flashcardId: string): Promise<FlashcardProgress> {
    const response = await api.get<FlashcardProgress>(
      `/flashcards/${flashcardId}/progress`
    );
    return response.data;
  },
};
