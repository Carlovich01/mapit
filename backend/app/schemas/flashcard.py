from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date


class FlashcardResponse(BaseModel):
    """Schema for flashcard response."""

    id: UUID
    question: str
    answer: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FlashcardReview(BaseModel):
    """Schema for reviewing a flashcard."""

    quality: int = Field(
        ..., ge=0, le=5, description="Quality of recall: 0-5 (SM-2 algorithm)"
    )


class FlashcardProgressResponse(BaseModel):
    """Schema for flashcard progress response."""

    id: UUID
    flashcard_id: UUID
    flashcard: FlashcardResponse
    easiness_factor: float
    interval: int
    repetitions: int
    next_review_date: date
    last_reviewed_at: datetime | None

    model_config = {"from_attributes": True}
