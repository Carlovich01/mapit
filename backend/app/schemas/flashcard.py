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
