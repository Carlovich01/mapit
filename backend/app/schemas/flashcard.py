from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date


class FlashcardResponse(BaseModel):
    """Esquema para la respuesta de la flashcard."""

    id: UUID
    question: str
    answer: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FlashcardReview(BaseModel):
    """Esquema para la revisión de una flashcard."""

    quality: int = Field(
        ..., ge=0, le=5, description="Calidad de recuerdo: 0-5 (algoritmo SM-2)"
    )


class FlashcardAnswerSubmission(BaseModel):
    """Esquema para enviar la respuesta escrita del usuario."""

    user_answer: str = Field(..., min_length=1, description="Respuesta escrita por el usuario")


class AIEvaluationResponse(BaseModel):
    """Esquema para la respuesta de evaluación de IA."""

    quality: int = Field(
        ..., ge=0, le=5, description="Calidad evaluada por la IA: 0-5 (algoritmo SM-2)"
    )
    feedback: str = Field(..., description="Retroalimentación de la IA sobre la respuesta")
    quality_label: str = Field(..., description="Etiqueta de calidad: Perfecto, Bien, Correcto, Difícil, Mal, No recuerdo")


class FlashcardProgressResponse(BaseModel):
    """Esquema para la respuesta de progreso de la flashcard."""

    id: UUID
    flashcard_id: UUID
    flashcard: FlashcardResponse
    easiness_factor: float
    interval: int
    repetitions: int
    next_review_date: date
    last_reviewed_at: datetime | None

    model_config = {"from_attributes": True}
