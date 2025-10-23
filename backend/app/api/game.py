from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.game import GameSessionCreate, GameSessionUpdate, GameSessionResponse
from app.services.game_service import GameService


router = APIRouter(prefix="/game", tags=["Game"])


@router.post(
    "/sessions", response_model=GameSessionResponse, status_code=status.HTTP_201_CREATED
)
async def create_game_session(
    session_data: GameSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crear una nueva sesión de juego."""
    game_service = GameService()

    try:
        session = await game_service.create_game_session(
            db=db, user_id=current_user.id, mind_map_id=session_data.mind_map_id
        )

        return session

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/sessions/{session_id}", response_model=GameSessionResponse)
async def complete_game_session(
    session_id: UUID,
    update_data: GameSessionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Completar una sesión de juego y enviar respuesta."""
    game_service = GameService()

    try:
        session = await game_service.complete_game_session(
            db=db,
            session_id=session_id,
            user_id=current_user.id,
            submitted_edges=[edge.model_dump() for edge in update_data.edges],
            time_elapsed_seconds=update_data.time_elapsed_seconds,
        )

        return session

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/sessions/{session_id}", response_model=GameSessionResponse)
async def get_game_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener detalles de la sesión de juego."""
    game_service = GameService()
    session = await game_service.get_game_session(
        db=db, session_id=session_id, user_id=current_user.id
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sesión de juego no encontrada"
        )

    return session


@router.get("/sessions", response_model=list[GameSessionResponse])
async def list_game_sessions(
    mind_map_id: UUID | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener las sesiones de juego del usuario."""
    game_service = GameService()
    sessions = await game_service.get_user_game_sessions(
        db=db, user_id=current_user.id, mind_map_id=mind_map_id, limit=limit
    )

    return sessions
