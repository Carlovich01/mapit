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
    """Sube PDF y crea un mapa mental."""
    # Validar tipo de archivo
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se permiten archivos PDF"
        )

    # Leer el contenido del archivo
    pdf_bytes = await file.read()

    if len(pdf_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="El archivo es demasiado grande. El tamaño máximo es 10MB",
        )

    # Crear un mapa mental
    try:
        mind_map_service = MindMapService()
        mind_map = await mind_map_service.create_mind_map_from_pdf(
            db=db,
            user_id=current_user.id,
            pdf_bytes=pdf_bytes,
            filename=file.filename,
            title=title,
        )

        # Generar tarjetas de estudio en segundo plano (async)
        flashcard_service = FlashcardService()
        await flashcard_service.generate_flashcards_for_mind_map(
            db=db, mind_map_id=mind_map.id, pdf_bytes=pdf_bytes
        )

        # Convertir al formato de respuesta
        return format_mind_map_response(mind_map)

    except ValueError as e:
        # Manejar errores de procesamiento de PDF (por ejemplo, sin texto extraíble)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Manejar errores inesperados
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando el PDF: {str(e)}",
        )


@router.get("", response_model=list[MindMapListResponse])
async def list_mind_maps(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener todos los mapas mentales del usuario actual."""
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
    """Obtener detalles del mapa mental por ID."""
    mind_map_service = MindMapService()
    mind_map = await mind_map_service.get_mind_map_by_id(
        db=db, mind_map_id=mind_map_id, user_id=current_user.id
    )

    if not mind_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mapa mental no encontrado"
        )

    return format_mind_map_response(mind_map)


def format_mind_map_response(mind_map) -> dict:
    """Formatear mapa mental con nodos y bordes para la respuesta."""
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
