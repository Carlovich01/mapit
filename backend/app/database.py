from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL, echo=False, future=True  # Set to False in production
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Clase base para todos los modelos de SQLAlchemy."""

    pass


async def get_db() -> AsyncSession:
    """Dependencia para obtener la sesión de la base de datos."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
