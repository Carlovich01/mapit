import asyncio
from logging.config import fileConfig
import os

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Importa tus modelos y Base
from app.database import Base
from app.models import (
    User,
    MindMap,
    MindMapNode,
    MindMapEdge,
    Flashcard,
    FlashcardProgress,
    GameSession,
)

# este es el objeto Alembic Config, que proporciona
# acceso a los valores dentro del archivo .ini en uso.
config = context.config

# Anule sqlalchemy.url con la variable de entorno si está disponible
if os.environ.get("DATABASE_URL"):
    config.set_main_option("sqlalchemy.url", os.environ.get("DATABASE_URL"))

# Interpretar el archivo de configuración para el registro de Python.
# Esta línea configura los loggers básicamente.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Agregue aquí el objeto MetaData de su modelo
# para soporte de 'autogeneración'
target_metadata = Base.metadata

# otros valores de la configuración, definidos por las necesidades de env.py,
# pueden ser adquiridos:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Ejecutar migraciones en modo "sin conexión". Esto configura el contexto 
    solo con una URL y no con un motor, aunque también se acepta un motor. 
    Al omitir la creación del motor, ni siquiera necesitamos que esté disponible una API de base de datos (DBAPI).
    Las llamadas a context.execute() emiten la cadena dada a la salida del script.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """En este escenario, necesitamos crear un motor y asociar una conexión con el contexto."""

    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Ejecutar migraciones en modo "en línea"."""

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
