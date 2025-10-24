from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.flashcard import (
    FlashcardResponse,
    FlashcardReview,
    FlashcardProgressResponse,
    FlashcardAnswerSubmission,
    AIEvaluationResponse,
)
from app.services.flashcard_service import FlashcardService
from app.services.ai_service import AIService


router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


@router.get(
    "/mind-maps/{mind_map_id}/flashcards", response_model=list[FlashcardResponse]
)
async def get_flashcards_for_mind_map(
    mind_map_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtén todas las tarjetas para un mapa mental."""
    flashcard_service = FlashcardService()
    flashcards = await flashcard_service.get_flashcards_for_mind_map(
        db=db, mind_map_id=mind_map_id
    )

    return flashcards


@router.post("/{flashcard_id}/review", response_model=FlashcardProgressResponse)
async def review_flashcard(
    flashcard_id: UUID,
    review: FlashcardReview,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revisar una tarjeta de estudio y actualizar el progreso utilizando el algoritmo SM-2."""
    flashcard_service = FlashcardService()

    try:
        progress = await flashcard_service.review_flashcard(
            db=db,
            user_id=current_user.id,
            flashcard_id=flashcard_id,
            quality=review.quality,
        )

        return progress

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/due", response_model=list[FlashcardProgressResponse])
async def get_due_flashcards(
    mind_map_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener tarjetas de estudio pendientes de revisión."""
    flashcard_service = FlashcardService()
    due_flashcards = await flashcard_service.get_due_flashcards(
        db=db, user_id=current_user.id, mind_map_id=mind_map_id
    )

    return due_flashcards


@router.get("/{flashcard_id}/progress", response_model=FlashcardProgressResponse)
async def get_flashcard_progress(
    flashcard_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener progreso para una tarjeta de estudio específica."""
    flashcard_service = FlashcardService()
    progress = await flashcard_service.get_flashcard_progress(
        db=db, user_id=current_user.id, flashcard_id=flashcard_id
    )

    return progress


@router.post("/{flashcard_id}/evaluate", response_model=AIEvaluationResponse)
async def evaluate_flashcard_answer(
    flashcard_id: UUID,
    submission: FlashcardAnswerSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluar la respuesta escrita del usuario usando IA y proporcionar retroalimentación."""
    flashcard_service = FlashcardService()
    ai_service = AIService()

    try:
        # Obtener la flashcard
        flashcard = await flashcard_service.get_flashcard_by_id(
            db=db, flashcard_id=flashcard_id
        )

        if not flashcard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flashcard no encontrada",
            )

        # Evaluar la respuesta con IA
        evaluation = await ai_service.evaluate_flashcard_answer(
            question=flashcard.question,
            correct_answer=flashcard.answer,
            user_answer=submission.user_answer,
        )

        return AIEvaluationResponse(**evaluation)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al evaluar la respuesta: {str(e)}",
        )
