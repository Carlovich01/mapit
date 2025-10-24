export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  flashcard: Flashcard;
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
}

export interface FlashcardReview {
  quality: number; // 0-5
}

export interface FlashcardAnswerSubmission {
  user_answer: string;
}

export interface AIEvaluationResponse {
  quality: number; // 0-5
  feedback: string;
  quality_label: string;
}
