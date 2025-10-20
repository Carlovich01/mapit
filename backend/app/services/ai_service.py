import json
import os
from google import genai
from google.genai.types import GenerateContentConfig
from app.config import settings


class AIService:
    """Service for AI operations using Gemini 2.5 Flash."""

    def __init__(self):
        """Initialize AI service with Gemini client."""
        # Set API key as environment variable (required by google-genai SDK)
        os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY

        self.client = genai.Client()
        self.model = "gemini-flash-latest"

    async def generate_mind_map_structure(
        self, text: str, title: str | None = None
    ) -> dict:
        """
        Generate mind map structure from text using Gemini.

        Args:
            text: Extracted text from PDF
            title: Optional title for the mind map

        Returns:
            Dict with structure: {
                "title": str,
                "nodes": [{"id": str, "label": str, "content": str, "level": int}],
                "edges": [{"id": str, "source": str, "target": str}]
            }
        """
        prompt = f"""Analiza el siguiente texto y genera un mapa mental jerárquico en formato JSON.

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON, sin texto adicional antes o después.

El JSON debe tener esta estructura exacta:
{{
  "title": "Título principal del contenido",
  "nodes": [
    {{"id": "1", "label": "Concepto principal", "content": "Descripción detallada", "level": 0}},
    {{"id": "2", "label": "Subconcepto", "content": "Detalles", "level": 1}}
  ],
  "edges": [
    {{"id": "e1", "source": "1", "target": "2"}}
  ]
}}

Reglas:
1. Crea un nodo raíz (level 0) con el tema principal
2. Crea nodos hijos (level 1, 2, etc.) para subtemas
3. Usa IDs numéricos para nodos (1, 2, 3...) y "e1", "e2"... para edges
4. El campo "content" debe tener información adicional relevante
5. Crea entre 5-15 nodos según la complejidad del texto
6. Asegúrate de que todos los nodos estén conectados al grafo principal

Texto a analizar:
{text[:4000]}

Responde SOLO con el JSON:"""

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
                config=GenerateContentConfig(
                    response_modalities=["TEXT"], temperature=0.7
                ),
            )

            # Extract JSON from response
            response_text = response.text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = (
                    "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
                )
                response_text = (
                    response_text.replace("```json", "").replace("```", "").strip()
                )

            structure = json.loads(response_text)

            # Validate structure
            if "nodes" not in structure or "edges" not in structure:
                raise ValueError("Invalid structure from AI")

            # Use provided title or AI-generated title
            if title:
                structure["title"] = title

            return structure

        except Exception as e:
            # Fallback: create a simple structure
            fallback_title = title or "Mapa Mental"
            return {
                "title": fallback_title,
                "nodes": [
                    {
                        "id": "1",
                        "label": fallback_title,
                        "content": text[:500],
                        "level": 0,
                    }
                ],
                "edges": [],
            }

    async def generate_flashcards(self, text: str, num_cards: int = 10) -> list[dict]:
        """
        Generate flashcards from text using Gemini.

        Args:
            text: Source text
            num_cards: Number of flashcards to generate

        Returns:
            List of dicts: [{"question": str, "answer": str}]
        """
        prompt = f"""Genera {num_cards} flashcards educativas del siguiente texto.

IMPORTANTE: Responde ÚNICAMENTE con el array JSON, sin texto adicional.

Formato requerido:
[
  {{"question": "¿Pregunta clara y concisa?", "answer": "Respuesta completa y precisa"}},
  {{"question": "¿Otra pregunta?", "answer": "Su respuesta"}}
]

Reglas:
1. Preguntas claras y directas
2. Respuestas completas pero concisas
3. Cubrir los conceptos más importantes del texto
4. Variar el tipo de preguntas (definición, comparación, aplicación)

Texto:
{text[:4000]}

Responde SOLO con el array JSON:"""

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
                config=GenerateContentConfig(
                    response_modalities=["TEXT"], temperature=0.8
                ),
            )

            response_text = response.text.strip()

            # Remove markdown code blocks
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = (
                    "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
                )
                response_text = (
                    response_text.replace("```json", "").replace("```", "").strip()
                )

            flashcards = json.loads(response_text)

            # Validate structure
            if not isinstance(flashcards, list):
                raise ValueError("Invalid flashcards format")

            return flashcards

        except Exception as e:
            # Fallback: create a simple flashcard
            return [
                {
                    "question": "¿Cuál es el tema principal del documento?",
                    "answer": text[:200],
                }
            ]
