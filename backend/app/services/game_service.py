from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime
from app.models.game import GameSession
from app.models.mind_map import MindMap, MindMapEdge
from app.utils.graph_validator import GraphValidator


class GameService:
    """Servicio para operaciones de sesiones de juego."""

    async def create_game_session(
        self, db: AsyncSession, user_id: UUID, mind_map_id: UUID
    ) -> GameSession:
        """Crear una nueva sesión de juego."""
        # Verificar que el mapa mental existe y pertenece al usuario
        result = await db.execute(
            select(MindMap).where(MindMap.id == mind_map_id, MindMap.user_id == user_id)
        )
        mind_map = result.scalar_one_or_none()

        if not mind_map:
            raise ValueError("Mapa mental no encontrado o acceso denegado")

        game_session = GameSession(user_id=user_id, mind_map_id=mind_map_id)

        db.add(game_session)
        await db.commit()
        await db.refresh(game_session)

        return game_session

    async def complete_game_session(
        self,
        db: AsyncSession,
        session_id: UUID,
        user_id: UUID,
        submitted_edges: list[dict],
        time_elapsed_seconds: int,
    ) -> GameSession:
        """
        Completar una sesión de juego y calcular la puntuación.

        Args:
            session_id: ID de la sesión de juego
            user_id: ID de usuario
            submitted_edges: Lista de aristas enviadas por el usuario
            time_elapsed_seconds: Tiempo empleado en completar

        Returns:
            Sesión de juego actualizada con puntuación
        """
        # Get game session
        result = await db.execute(
            select(GameSession).where(
                GameSession.id == session_id, GameSession.user_id == user_id
            )
        )
        game_session = result.scalar_one_or_none()

        if not game_session:
            raise ValueError("Sesión de juego no encontrada")

        if game_session.completed:
            raise ValueError("Sesión de juego ya completada")

        # Get original edges from mind map
        result = await db.execute(
            select(MindMapEdge).where(
                MindMapEdge.mind_map_id == game_session.mind_map_id
            )
        )
        original_edges = list(result.scalars().all())

        # Convert to dict format for comparison
        original_edges_dict = [
            {"source": edge.source_node_id, "target": edge.target_node_id}
            for edge in original_edges
        ]

        # Calculate score using graph validator
        score = GraphValidator.calculate_score(original_edges_dict, submitted_edges)

        # Update game session
        game_session.score = score
        game_session.completed = True
        game_session.time_elapsed_seconds = time_elapsed_seconds
        game_session.completed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(game_session)

        return game_session

    async def get_game_session(
        self, db: AsyncSession, session_id: UUID, user_id: UUID
    ) -> GameSession | None:
        """Obtener sesión de juego por ID."""
        result = await db.execute(
            select(GameSession).where(
                GameSession.id == session_id, GameSession.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def get_user_game_sessions(
        self,
        db: AsyncSession,
        user_id: UUID,
        mind_map_id: UUID | None = None,
        limit: int = 50,
    ) -> list[GameSession]:
        """Obtener sesiones de juego del usuario."""
        query = (
            select(GameSession)
            .where(GameSession.user_id == user_id)
            .order_by(GameSession.created_at.desc())
            .limit(limit)
        )

        if mind_map_id:
            query = query.where(GameSession.mind_map_id == mind_map_id)

        result = await db.execute(query)
        return list(result.scalars().all())
