from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class NodeSchema(BaseModel):
    """Schema for a mind map node."""

    id: str = Field(..., description="Unique node identifier for React Flow")
    label: str = Field(..., description="Node label/title")
    content: str | None = Field(None, description="Detailed content")
    position: dict[str, float] | None = Field(None, description="Position {x, y}")
    level: int = Field(0, description="Hierarchy level (0=root)")

    model_config = {"from_attributes": True}


class EdgeSchema(BaseModel):
    """Schema for a mind map edge."""

    id: str = Field(..., description="Unique edge identifier")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    type: str = Field(default="floating", description="Edge type for React Flow")

    model_config = {"from_attributes": True}


class MindMapCreate(BaseModel):
    """Schema for creating a mind map (PDF upload)."""

    # File will be handled in the endpoint via UploadFile
    title: str | None = None


class MindMapResponse(BaseModel):
    """Schema for mind map response with full details."""

    id: UUID
    title: str
    pdf_filename: str | None
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MindMapListResponse(BaseModel):
    """Schema for mind map list item (without nodes/edges)."""

    id: UUID
    title: str
    pdf_filename: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
