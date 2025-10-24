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
    """Servicio para operaciones con flashcards y algoritmo SM-2."""

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
        Generar flashcards para un mapa mental.

        Si no se proporciona pdf_bytes, se utilizarán las flashcards existentes o fallará.
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
        """Obtener todas las flashcards para un mapa mental."""
        result = await db.execute(
            select(Flashcard)
            .where(Flashcard.mind_map_id == mind_map_id)
            .order_by(Flashcard.created_at)
        )
        return list(result.scalars().all())

    async def get_flashcard_progress(
        self, db: AsyncSession, user_id: UUID, flashcard_id: UUID
    ) -> FlashcardProgress:
        """Obtener o crear el progreso de la flashcard para un usuario."""
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
        Actualizar el progreso de la flashcard usando el algoritmo SM-2.

        Args:
            Calidad: 0-5 (0=apagón total, 5=respuesta perfecta)
        """
        progress = await self.get_flashcard_progress(db, user_id, flashcard_id)

        # Algoritmo SM-2
        if quality >= 3:
            # Respuesta correcta
            if progress.repetitions == 0:
                progress.interval = 1
            elif progress.repetitions == 1:
                progress.interval = 6
            else:
                progress.interval = int(progress.interval * progress.easiness_factor)

            progress.repetitions += 1
        else:
            # Respuesta incorrecta - reiniciar
            progress.repetitions = 0
            progress.interval = 1

        # Actualizar el factor de facilidad
        progress.easiness_factor = max(
            1.3,
            progress.easiness_factor
            + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
        )

        # Establecer la próxima fecha de revisión
        progress.next_review_date = date.today() + timedelta(days=progress.interval)
        progress.last_reviewed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(progress)

        return progress

    async def get_due_flashcards(
        self, db: AsyncSession, user_id: UUID, mind_map_id: UUID | None = None
    ) -> list[FlashcardProgress]:
        """Obtener flashcards pendientes de revisión, incluidas las nunca revisadas."""
        # Obtenga tarjetas didácticas que deben revisarse
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
        due_flashcards = list(result.scalars().all())

        # Obtenga todas las flashcards para los mapas mentales
        flashcard_query = select(Flashcard)
        if mind_map_id:
            flashcard_query = flashcard_query.where(
                Flashcard.mind_map_id == mind_map_id
            )
        else:
            # Obtener todas las flashcards para los mapas mentales del usuario
            flashcard_query = flashcard_query.join(MindMap).where(
                MindMap.user_id == user_id
            )

        flashcard_result = await db.execute(flashcard_query)
        all_flashcards = list(flashcard_result.scalars().all())

        # Obtener TODO el progreso existente para estas tarjetas didácticas (no solo las vencidas)
        # para evitar la creación duplicada
        all_progress_query = select(FlashcardProgress).where(
            FlashcardProgress.user_id == user_id
        )
        if mind_map_id:
            all_progress_query = all_progress_query.join(Flashcard).where(
                Flashcard.mind_map_id == mind_map_id
            )
        else:
            all_progress_query = (
                all_progress_query.join(Flashcard)
                .join(MindMap)
                .where(MindMap.user_id == user_id)
            )

        all_progress_result = await db.execute(all_progress_query)
        all_existing_progress = list(all_progress_result.scalars().all())

        # Obtenga los ID de las flashcards que ya tienen CUALQUIER progreso (debido o no)
        reviewed_flashcard_ids = {
            progress.flashcard_id for progress in all_existing_progress
        }

        # Crear y guardar entradas de progreso para flashcards nunca revisadas
        new_progress_list = []
        for flashcard in all_flashcards:
            if flashcard.id not in reviewed_flashcard_ids:
                # Crear progreso inicial para esta flashcard
                progress = FlashcardProgress(
                    user_id=user_id,
                    flashcard_id=flashcard.id,
                    easiness_factor=2.5,
                    interval=0,
                    repetitions=0,
                    next_review_date=date.today(),
                )
                db.add(progress)
                new_progress_list.append(progress)

        # Confirmar todos los nuevos registros de progreso a la vez
        if new_progress_list:
            await db.commit()

            # Recargar con relaciones de tarjetas didácticas
            for progress in new_progress_list:
                await db.refresh(progress)

            # Cargar relación de tarjetas didácticas
            new_progress_ids = [p.id for p in new_progress_list]
            reload_query = (
                select(FlashcardProgress)
                .where(FlashcardProgress.id.in_(new_progress_ids))
                .options(selectinload(FlashcardProgress.flashcard))
            )
            reload_result = await db.execute(reload_query)
            reloaded_progress = list(reload_result.scalars().all())
            due_flashcards.extend(reloaded_progress)

        return due_flashcards
