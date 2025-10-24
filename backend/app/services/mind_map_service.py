from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.models.mind_map import MindMap, MindMapNode, MindMapEdge
from app.services.pdf_service import PDFService
from app.services.ai_service import AIService


class MindMapService:
    """Servicio para operaciones de mapas mentales."""

    def __init__(self):
        self.pdf_service = PDFService()
        self.ai_service = AIService()

    async def create_mind_map_from_pdf(
        self,
        db: AsyncSession,
        user_id: UUID,
        pdf_bytes: bytes,
        filename: str,
        title: str | None = None,
    ) -> MindMap:
        """
        Crear mapa mental a partir de PDF.

        Args:
            db: Sesión de base de datos
            user_id: ID de usuario
            pdf_bytes: Contenido del archivo PDF
            filename: Nombre del archivo original
            title: Título personalizado opcional

        Returns:
            Crear un mapa mental con nodos y aristas
        """
        # Extract text and calculate hash
        text, content_hash = await self.pdf_service.process_pdf(pdf_bytes)

        # Generate mind map structure using AI
        structure = await self.ai_service.generate_mind_map_structure(text, title)

        # Create mind map
        mind_map = MindMap(
            user_id=user_id,
            title=structure.get("title", title or filename),
            pdf_filename=filename,
            pdf_content_hash=content_hash,
        )

        db.add(mind_map)
        await db.flush()  # Get mind_map.id

        # Create nodes
        for node_data in structure.get("nodes", []):
            position = node_data.get("position", {})

            node = MindMapNode(
                mind_map_id=mind_map.id,
                node_id=node_data["id"],
                label=node_data["label"],
                content=node_data.get("content"),
                position_x=position.get("x"),
                position_y=position.get("y"),
                level=node_data.get("level", 0),
            )
            db.add(node)

        # Create edges
        for edge_data in structure.get("edges", []):
            edge = MindMapEdge(
                mind_map_id=mind_map.id,
                edge_id=edge_data["id"],
                source_node_id=edge_data["source"],
                target_node_id=edge_data["target"],
            )
            db.add(edge)

        await db.commit()
        await db.refresh(mind_map)

        # Load relationships
        result = await db.execute(
            select(MindMap)
            .where(MindMap.id == mind_map.id)
            .options(selectinload(MindMap.nodes), selectinload(MindMap.edges))
        )
        mind_map = result.scalar_one()

        return mind_map

    async def get_mind_map_by_id(
        self, db: AsyncSession, mind_map_id: UUID, user_id: UUID
    ) -> MindMap | None:
        """Obtener mapa mental por ID con verificación de autorización."""
        result = await db.execute(
            select(MindMap)
            .where(MindMap.id == mind_map_id, MindMap.user_id == user_id)
            .options(selectinload(MindMap.nodes), selectinload(MindMap.edges))
        )
        return result.scalar_one_or_none()

    async def get_user_mind_maps(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> list[MindMap]:
        """Obtener todos los mapas mentales de un usuario."""
        result = await db.execute(
            select(MindMap)
            .where(MindMap.user_id == user_id)
            .order_by(MindMap.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
