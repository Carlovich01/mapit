import fitz  # PyMuPDF
import hashlib
from io import BytesIO


class PDFService:
    """Service for PDF processing (in-memory only)."""

    @staticmethod
    async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """
        Extract text from PDF bytes (in-memory processing).

        Args:
            pdf_bytes: PDF file content as bytes

        Returns:
            Extracted text from all pages
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
        """Calculate SHA-256 hash of content."""
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    async def process_pdf(pdf_bytes: bytes) -> tuple[str, str]:
        """
        Process PDF: extract text and calculate hash.

        Returns:
            Tuple of (extracted_text, content_hash)

        Raises:
            ValueError: If PDF contains insufficient text
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
