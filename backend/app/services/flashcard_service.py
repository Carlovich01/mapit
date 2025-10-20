from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime, date, timedelta
from app.models.flashcard import Flashcard, FlashcardProgress
from app.models.mind_map import MindMap
from app.services.ai_service import AIService
from app.services.pdf_service import PDFService


class FlashcardService:
    """Service for flashcard operations and SM-2 algorithm."""

    def __init__(self):
        self.ai_service = AIService()

    async def generate_flashcards_for_mind_map(
        self,
        db: AsyncSession,
        mind_map_id: UUID,
        pdf_bytes: bytes | None = None,
        num_cards: int = 10,
    ) -> list[Flashcard]:
        """
        Generate flashcards for a mind map.

        If pdf_bytes not provided, will use existing flashcards or fail.
        """
        # Check if flashcards already exist
        result = await db.execute(
            select(Flashcard).where(Flashcard.mind_map_id == mind_map_id)
        )
        existing_flashcards = list(result.scalars().all())

        if existing_flashcards:
            return existing_flashcards

        # Need PDF to generate flashcards
        if not pdf_bytes:
            return []

        # Extract text
        pdf_service = PDFService()
        text, _ = await pdf_service.process_pdf(pdf_bytes)

        # Generate flashcards using AI
        flashcard_data = await self.ai_service.generate_flashcards(text, num_cards)

        # Create flashcards
        flashcards = []
        for data in flashcard_data:
            flashcard = Flashcard(
                mind_map_id=mind_map_id,
                question=data["question"],
                answer=data["answer"],
            )
            db.add(flashcard)
            flashcards.append(flashcard)

        await db.commit()

        return flashcards

    async def get_flashcards_for_mind_map(
        self, db: AsyncSession, mind_map_id: UUID
    ) -> list[Flashcard]:
        """Get all flashcards for a mind map."""
        result = await db.execute(
            select(Flashcard)
            .where(Flashcard.mind_map_id == mind_map_id)
            .order_by(Flashcard.created_at)
        )
        return list(result.scalars().all())

    async def get_flashcard_progress(
        self, db: AsyncSession, user_id: UUID, flashcard_id: UUID
    ) -> FlashcardProgress:
        """Get or create flashcard progress for a user."""
        result = await db.execute(
            select(FlashcardProgress)
            .where(
                FlashcardProgress.user_id == user_id,
                FlashcardProgress.flashcard_id == flashcard_id,
            )
            .options(selectinload(FlashcardProgress.flashcard))
        )
        progress = result.scalar_one_or_none()

        if not progress:
            # Create initial progress
            progress = FlashcardProgress(
                user_id=user_id,
                flashcard_id=flashcard_id,
                easiness_factor=2.5,
                interval=0,
                repetitions=0,
                next_review_date=date.today(),
            )
            db.add(progress)
            await db.commit()
            await db.refresh(progress)

            # Load flashcard
            result = await db.execute(
                select(FlashcardProgress)
                .where(FlashcardProgress.id == progress.id)
                .options(selectinload(FlashcardProgress.flashcard))
            )
            progress = result.scalar_one()

        return progress

    async def review_flashcard(
        self, db: AsyncSession, user_id: UUID, flashcard_id: UUID, quality: int
    ) -> FlashcardProgress:
        """
        Update flashcard progress using SM-2 algorithm.

        Args:
            quality: 0-5 (0=complete blackout, 5=perfect response)
        """
        progress = await self.get_flashcard_progress(db, user_id, flashcard_id)

        # SM-2 Algorithm
        if quality >= 3:
            # Correct response
            if progress.repetitions == 0:
                progress.interval = 1
            elif progress.repetitions == 1:
                progress.interval = 6
            else:
                progress.interval = int(progress.interval * progress.easiness_factor)

            progress.repetitions += 1
        else:
            # Incorrect response - restart
            progress.repetitions = 0
            progress.interval = 1

        # Update easiness factor
        progress.easiness_factor = max(
            1.3,
            progress.easiness_factor
            + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
        )

        # Set next review date
        progress.next_review_date = date.today() + timedelta(days=progress.interval)
        progress.last_reviewed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(progress)

        return progress

    async def get_due_flashcards(
        self, db: AsyncSession, user_id: UUID, mind_map_id: UUID | None = None
    ) -> list[FlashcardProgress]:
        """Get flashcards due for review."""
        query = (
            select(FlashcardProgress)
            .where(
                FlashcardProgress.user_id == user_id,
                FlashcardProgress.next_review_date <= date.today(),
            )
            .options(selectinload(FlashcardProgress.flashcard))
        )

        if mind_map_id:
            query = query.join(Flashcard).where(Flashcard.mind_map_id == mind_map_id)

        result = await db.execute(query)
        return list(result.scalars().all())
