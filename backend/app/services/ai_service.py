import json
import os
from google import genai
from google.genai.types import GenerateContentConfig
from app.config import settings


class AIService:
    """Servicio para operaciones de IA utilizando Gemini Flash Latest."""

    def __init__(self):
        """Inicializar el servicio de IA con el cliente de Gemini."""
        # Establecer la clave API como variable de entorno (requerida por el SDK de google-genai)
        os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY

        self.client = genai.Client()
        self.model = "gemini-flash-latest"

    async def generate_mind_map_structure(
        self, text: str, title: str | None = None
    ) -> dict:
        """
        Genere la estructura de un mapa mental a partir del texto usando Gemini.

        Args:
            text: Texto extraído de PDF
            title: Título opcional para el mapa mental

        Returns:
            Dict con la estructura: {
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
    {{"id": "2", "label": "Subconcepto", "content": "Detalles", "level": 1}},
    {{"id": "3", "label": "Otro subconcepto", "content": "Más detalles", "level": 1}}
  ],
  "edges": [
    {{"id": "e1", "source": "1", "target": "2"}},
    {{"id": "e2", "source": "1", "target": "3"}}
  ]
}}

Reglas OBLIGATORIAS:
1. Crea un nodo raíz (level 0) con el tema principal
2. Crea nodos hijos (level 1, 2, etc.) para subtemas
3. Usa IDs numéricos para nodos (1, 2, 3...) y "e1", "e2"... para edges
4. El campo "content" debe tener información adicional relevante y específica
5. TODOS los nodos DEBEN estar conectados (no nodos aislados)

Texto a analizar:
{text}

Responde SOLO con el JSON (sin markdown, sin explicaciones):"""

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
                config=GenerateContentConfig(response_modalities=["TEXT"]),
            )

            # Extraer JSON de la respuesta
            response_text = response.text.strip()

            # Eliminar bloques de código de rebajas si están presentes
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = (
                    "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
                )
                response_text = (
                    response_text.replace("```json", "").replace("```", "").strip()
                )

            structure = json.loads(response_text)

            # Validar estructura
            if "nodes" not in structure or "edges" not in structure:
                raise ValueError("Estructura no válida de la IA: nodos o bordes faltantes")

            # Validar nodos mínimos
            if len(structure["nodes"]) < 2:
                raise ValueError(
                    f"La IA generó un número insuficiente de nodos: solo {len(structure['nodes'])} nodo(s)"
                )

            # Utilice el título proporcionado o el título generado por IA
            if title:
                structure["title"] = title

            return structure

        except json.JSONDecodeError as e:
            # Registrar el error para depurarlo
            print(f"Error de decodificación de JSON: {str(e)}")
            print(
                f"Response text: {response_text if 'response_text' in locals() else 'N/A'}"
            )
            raise ValueError(
                "La IA no pudo generar un mapa mental válido. "
                "Por favor, intenta con un PDF diferente o con más contenido."
            )
        except ValueError as e:
            # Volver a generar errores de validación
            print(f"Validation error: {str(e)}")
            raise ValueError(
                f"Error al generar el mapa mental: {str(e)}. "
                "El PDF puede ser muy corto o el contenido no es adecuado para generar un mapa mental."
            )
        except Exception as e:
            # Registrar el error para depurarlo
            print(f"Error inesperado al generar el mapa mental: {str(e)}")
            print(
                f"Texto de respuesta (si está disponible): {response_text if 'response_text' in locals() else 'N/A'}"
            )
            raise ValueError(f"Error inesperado al procesar el PDF con IA: {str(e)}")

    async def generate_flashcards(self, text: str, num_cards: int = 10) -> list[dict]:
        """
        Genera tarjetas didácticas a partir de texto usando Gemini.

        Args:
            text: Texto fuente
            num_cards: Número de tarjetas didácticas a generar

        Returns:
            Lista de dicts: [{"question": str, "answer": str}]
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
{text}

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

            # Eliminar bloques de código de rebajas
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = (
                    "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
                )
                response_text = (
                    response_text.replace("```json", "").replace("```", "").strip()
                )

            flashcards = json.loads(response_text)

            # Validar estructura
            if not isinstance(flashcards, list):
                raise ValueError("Formato de flashcards no válido")

            return flashcards

        except Exception as e:
            # Respaldo: crear una tarjeta didáctica sencilla
            return [
                {
                    "question": "¿Cuál es el tema principal del documento?",
                    "answer": text,
                }
            ]

    async def evaluate_flashcard_answer(
        self, question: str, correct_answer: str, user_answer: str
    ) -> dict:
        """
        Evalúa la respuesta del usuario a una flashcard usando IA.

        Args:
            question: La pregunta de la flashcard
            correct_answer: La respuesta correcta
            user_answer: La respuesta proporcionada por el usuario

        Returns:
            Dict con: {
                "quality": int (0-5),
                "feedback": str,
                "quality_label": str
            }
        """
        prompt = f"""Eres un tutor educativo. Evalúa la respuesta del estudiante a una pregunta de flashcard.

PREGUNTA: {question}

RESPUESTA CORRECTA: {correct_answer}

RESPUESTA DEL ESTUDIANTE: {user_answer}

Evalúa la respuesta del estudiante y proporciona:
1. Una calificación de calidad (0-5) según estos criterios:
   - 5 (Perfecto): Respuesta completamente correcta y precisa
   - 4 (Bien): Respuesta correcta con detalles adecuados
   - 3 (Correcto): Respuesta correcta pero incompleta o con algunos errores menores
   - 2 (Difícil): Respuesta parcialmente correcta, falta información importante
   - 1 (Mal): Respuesta incorrecta o con errores significativos
   - 0 (No recuerdo): Respuesta completamente incorrecta o sin sentido

2. Retroalimentación constructiva y específica (máximo 200 caracteres)

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON, sin texto adicional.

Formato requerido:
{{
  "quality": 0-5,
  "feedback": "Retroalimentación constructiva aquí",
  "quality_label": "Perfecto/Bien/Correcto/Difícil/Mal/No recuerdo"
}}

Responde SOLO con el JSON:"""

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
                config=GenerateContentConfig(
                    response_modalities=["TEXT"]
                ),
            )

            response_text = response.text.strip()

            # Eliminar bloques de código markdown
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = (
                    "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
                )
                response_text = (
                    response_text.replace("```json", "").replace("```", "").strip()
                )

            evaluation = json.loads(response_text)

            # Validar que tenga los campos requeridos
            if (
                "quality" not in evaluation
                or "feedback" not in evaluation
                or "quality_label" not in evaluation
            ):
                raise ValueError("Evaluación incompleta de la IA")

            # Asegurar que quality esté en el rango correcto
            evaluation["quality"] = max(0, min(5, int(evaluation["quality"])))

            return evaluation

        except Exception as e:
            # Respaldo: evaluación básica por coincidencia de texto
            user_lower = user_answer.lower().strip()
            correct_lower = correct_answer.lower().strip()

            if user_lower == correct_lower:
                return {
                    "quality": 5,
                    "feedback": "Respuesta exactamente correcta",
                    "quality_label": "Perfecto",
                }
            elif correct_lower in user_lower or user_lower in correct_lower:
                return {
                    "quality": 3,
                    "feedback": "Respuesta parcialmente correcta. Revisa los detalles.",
                    "quality_label": "Correcto",
                }
            else:
                return {
                    "quality": 1,
                    "feedback": "Respuesta incorrecta. Repasa el concepto.",
                    "quality_label": "Mal",
                }
