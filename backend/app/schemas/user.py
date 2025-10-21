from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)


class UserResponse(BaseModel):
    """Schema for user response."""

    id: UUID
    email: str
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for JWT token payload."""

    user_id: str | None = None
