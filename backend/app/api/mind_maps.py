from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.mind_map import (
    MindMapResponse,
    MindMapListResponse,
    NodeSchema,
    EdgeSchema,
)
from app.services.mind_map_service import MindMapService
from app.services.flashcard_service import FlashcardService


router = APIRouter(prefix="/mind-maps", tags=["Mind Maps"])


@router.post("", response_model=MindMapResponse, status_code=status.HTTP_201_CREATED)
async def create_mind_map(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload PDF and create mind map."""
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are allowed"
        )

    # Read file content
    pdf_bytes = await file.read()

    if len(pdf_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB",
        )

    # Create mind map
    mind_map_service = MindMapService()
    mind_map = await mind_map_service.create_mind_map_from_pdf(
        db=db,
        user_id=current_user.id,
        pdf_bytes=pdf_bytes,
        filename=file.filename,
        title=title,
    )

    # Generate flashcards in background (async)
    flashcard_service = FlashcardService()
    await flashcard_service.generate_flashcards_for_mind_map(
        db=db, mind_map_id=mind_map.id, pdf_bytes=pdf_bytes
    )

    # Convert to response format
    return format_mind_map_response(mind_map)


@router.get("", response_model=list[MindMapListResponse])
async def list_mind_maps(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all mind maps for current user."""
    mind_map_service = MindMapService()
    mind_maps = await mind_map_service.get_user_mind_maps(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )

    return mind_maps


@router.get("/{mind_map_id}", response_model=MindMapResponse)
async def get_mind_map(
    mind_map_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get mind map details by ID."""
    mind_map_service = MindMapService()
    mind_map = await mind_map_service.get_mind_map_by_id(
        db=db, mind_map_id=mind_map_id, user_id=current_user.id
    )

    if not mind_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mind map not found"
        )

    return format_mind_map_response(mind_map)


def format_mind_map_response(mind_map) -> dict:
    """Format mind map with nodes and edges for response."""
    nodes = [
        {
            "id": node.node_id,
            "label": node.label,
            "content": node.content,
            "position": (
                {"x": node.position_x, "y": node.position_y}
                if node.position_x is not None
                else None
            ),
            "level": node.level,
        }
        for node in mind_map.nodes
    ]

    edges = [
        {
            "id": edge.edge_id,
            "source": edge.source_node_id,
            "target": edge.target_node_id,
            "type": "floating",
        }
        for edge in mind_map.edges
    ]

    return {
        "id": mind_map.id,
        "title": mind_map.title,
        "pdf_filename": mind_map.pdf_filename,
        "nodes": nodes,
        "edges": edges,
        "created_at": mind_map.created_at,
        "updated_at": mind_map.updated_at,
    }
