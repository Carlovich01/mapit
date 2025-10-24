import fitz  # PyMuPDF
import hashlib
from io import BytesIO


class PDFService:
    """Servicio para procesamiento de PDF (solo en memoria)"""

    @staticmethod
    async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """
        Extraer texto de bytes PDF (procesamiento en memoria).

        Args:
            pdf_bytes: Contenido del archivo PDF en bytes

        Returns:
            Texto extraído de todas las páginas
        """
        text_content = []

        # Open PDF from memory
        pdf_stream = BytesIO(pdf_bytes)

        with fitz.open(stream=pdf_stream, filetype="pdf") as doc:
            for page in doc:
                text = page.get_text()
                if text.strip():
                    text_content.append(text)

        return "\n\n".join(text_content)

    @staticmethod
    def calculate_content_hash(content: bytes) -> str:
        """Calcular el hash SHA-256 del contenido."""
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    async def process_pdf(pdf_bytes: bytes) -> tuple[str, str]:
        """
        Process PDF: Extraer texto y calcular hash.

        Returns:
            Tuple de (extracted_text, content_hash)

        Raises:
            ValueError: Si el PDF no contiene suficiente texto
        """
        text = await PDFService.extract_text_from_pdf(pdf_bytes)
        content_hash = PDFService.calculate_content_hash(pdf_bytes)

        # Validate extracted text
        if not text or len(text.strip()) < 50:
            raise ValueError(
                "El PDF no contiene suficiente texto extraíble. "
                "Asegúrate de que el PDF contenga texto real y no solo imágenes escaneadas."
            )

        return text, content_hash
