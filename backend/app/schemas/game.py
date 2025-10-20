from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class EdgeSubmission(BaseModel):
    """Schema for submitted edge in game."""

    source: str
    target: str


class GameSessionCreate(BaseModel):
    """Schema for creating a game session."""

    mind_map_id: UUID


class GameSessionUpdate(BaseModel):
    """Schema for updating/completing a game session."""

    edges: list[EdgeSubmission] = Field(..., description="User's submitted edges")
    time_elapsed_seconds: int = Field(..., ge=0)


class GameSessionResponse(BaseModel):
    """Schema for game session response."""

    id: UUID
    mind_map_id: UUID
    score: int
    completed: bool
    time_elapsed_seconds: int | None
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}
