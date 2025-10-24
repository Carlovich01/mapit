from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    """Esquema para el registro de usuarios."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)


class UserResponse(BaseModel):
    """Esquema para la respuesta de usuario."""

    id: UUID
    email: str
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """Esquema para la respuesta del token JWT."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Esquema para el payload del token JWT."""

    user_id: str | None = None
