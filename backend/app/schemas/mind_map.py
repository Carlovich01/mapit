from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class NodeSchema(BaseModel):
    """Esquema para un nodo de mapa mental."""

    id: str = Field(..., description="Unique node identifier for React Flow")
    label: str = Field(..., description="Node label/title")
    content: str | None = Field(None, description="Detailed content")
    position: dict[str, float] | None = Field(None, description="Position {x, y}")
    level: int = Field(0, description="Hierarchy level (0=root)")

    model_config = {"from_attributes": True}


class EdgeSchema(BaseModel):
    """Esquema para una conexión en un mapa mental."""

    id: str = Field(..., description="Unique edge identifier")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    type: str = Field(default="floating", description="Edge type for React Flow")

    model_config = {"from_attributes": True}


class MindMapCreate(BaseModel):
    """Esquema para crear un mapa mental (subida de PDF)."""

    # El archivo será manejado en el endpoint a través de UploadFile
    title: str | None = None


class MindMapResponse(BaseModel):
    """Esquema para la respuesta de un mapa mental con todos los detalles."""

    id: UUID
    title: str
    pdf_filename: str | None
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MindMapListResponse(BaseModel):
    """Esquema para un elemento de lista de mapas mentales (sin nodos/conexiones)."""

    id: UUID
    title: str
    pdf_filename: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
