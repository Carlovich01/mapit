import uuid
from datetime import datetime
from sqlalchemy import (
    String,
    DateTime,
    Text,
    Float,
    Integer,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class MindMap(Base):
    """Mind map generated from PDF."""

    __tablename__ = "mind_maps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    pdf_filename: Mapped[str | None] = mapped_column(String(500))
    pdf_content_hash: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mind_maps")
    nodes: Mapped[list["MindMapNode"]] = relationship(
        "MindMapNode", back_populates="mind_map", cascade="all, delete-orphan"
    )
    edges: Mapped[list["MindMapEdge"]] = relationship(
        "MindMapEdge", back_populates="mind_map", cascade="all, delete-orphan"
    )
    flashcards: Mapped[list["Flashcard"]] = relationship(
        "Flashcard", back_populates="mind_map", cascade="all, delete-orphan"
    )
    game_sessions: Mapped[list["GameSession"]] = relationship(
        "GameSession", back_populates="mind_map", cascade="all, delete-orphan"
    )


class MindMapNode(Base):
    """Node in a mind map (graph structure)."""

    __tablename__ = "mind_map_nodes"
    __table_args__ = (
        UniqueConstraint("mind_map_id", "node_id", name="uq_mind_map_node"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mind_map_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mind_maps.id", ondelete="CASCADE"),
        nullable=False,
    )
    node_id: Mapped[str] = mapped_column(String(100), nullable=False)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str | None] = mapped_column(Text)
    position_x: Mapped[float | None] = mapped_column(Float)
    position_y: Mapped[float | None] = mapped_column(Float)
    level: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    mind_map: Mapped["MindMap"] = relationship("MindMap", back_populates="nodes")


class MindMapEdge(Base):
    """Edge connecting nodes in a mind map."""

    __tablename__ = "mind_map_edges"
    __table_args__ = (
        UniqueConstraint("mind_map_id", "edge_id", name="uq_mind_map_edge"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mind_map_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mind_maps.id", ondelete="CASCADE"),
        nullable=False,
    )
    edge_id: Mapped[str] = mapped_column(String(100), nullable=False)
    source_node_id: Mapped[str] = mapped_column(String(100), nullable=False)
    target_node_id: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    mind_map: Mapped["MindMap"] = relationship("MindMap", back_populates="edges")
