from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, mind_maps, flashcards, game


# Create FastAPI app
app = FastAPI(
    title="MapIT API",
    description="Transform PDFs into interactive learning tools with AI",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(mind_maps.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(game.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "MapIT API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
