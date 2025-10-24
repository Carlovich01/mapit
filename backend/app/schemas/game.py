from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class EdgeSubmission(BaseModel):
    """Esquema para el borde presentado en el juego."""

    source: str
    target: str


class GameSessionCreate(BaseModel):
    """Esquema para crear una sesión de juego."""

    mind_map_id: UUID


class GameSessionUpdate(BaseModel):
    """Esquema para actualizar/completar una sesión de juego."""

    edges: list[EdgeSubmission] = Field(..., description="User's submitted edges")
    time_elapsed_seconds: int = Field(..., ge=0)


class GameSessionResponse(BaseModel):
    """Esquema para la respuesta de una sesión de juego."""

    id: UUID
    mind_map_id: UUID
    score: int
    completed: bool
    time_elapsed_seconds: int | None
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}
