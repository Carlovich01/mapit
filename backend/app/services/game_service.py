from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime
from app.models.game import GameSession
from app.models.mind_map import MindMap, MindMapEdge
from app.utils.graph_validator import GraphValidator


class GameService:
    """Service for game session operations."""

    async def create_game_session(
        self, db: AsyncSession, user_id: UUID, mind_map_id: UUID
    ) -> GameSession:
        """Create a new game session."""
        # Verify mind map exists and belongs to user
        result = await db.execute(
            select(MindMap).where(MindMap.id == mind_map_id, MindMap.user_id == user_id)
        )
        mind_map = result.scalar_one_or_none()

        if not mind_map:
            raise ValueError("Mind map not found or access denied")

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
        Complete a game session and calculate score.

        Args:
            session_id: Game session ID
            user_id: User ID
            submitted_edges: List of edges submitted by user
            time_elapsed_seconds: Time taken to complete

        Returns:
            Updated GameSession with score
        """
        # Get game session
        result = await db.execute(
            select(GameSession).where(
                GameSession.id == session_id, GameSession.user_id == user_id
            )
        )
        game_session = result.scalar_one_or_none()

        if not game_session:
            raise ValueError("Game session not found")

        if game_session.completed:
            raise ValueError("Game session already completed")

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
        """Get game session by ID."""
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
        """Get user's game sessions."""
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
