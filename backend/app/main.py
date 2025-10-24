from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, mind_maps, flashcards, game
from app.middleware import LoggingMiddleware
from app.utils.logger import setup_logger, log_success

# Configuracion del logger
logger = setup_logger("mapit")

# Crear una aplicación FastAPI
app = FastAPI(
    title="MapIT API",
    description="Transforme archivos PDF en herramientas de aprendizaje interactivas con IA",
    version="1.0.0",
)

# Añadir middleware de logging (primero, para que registre todo)
app.add_middleware(LoggingMiddleware)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api")
app.include_router(mind_maps.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(game.router, prefix="/api")


@app.get("/")
async def root():
    """Endpoint raiz."""
    return {"message": "MapIT API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    """Endpoint de verificación de estado."""
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """Mensaje de inicio del registro"""
    log_success("MapIT API iniciada correctamente - Servidor corriendo")
    logger.info(f"Documentación disponible en: http://localhost:8000/docs")
