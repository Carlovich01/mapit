"""
Logging middleware for HTTP requests and responses.
"""

import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from colorama import Fore, Style
from app.utils.logger import setup_logger

logger = setup_logger("http")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para registrar solicitudes y respuestas HTTP con colores."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        """
        Procesa la solicitud y regístrala con los colores apropiados.

        Args:
            request: La solicitud entrante
            call_next: El siguiente middleware/endpoint a llamar

        Returns:
            Objeto de respuesta
        """
        # Temporizador de inicio
        start_time = time.time()

        # Obtener detalles de la solicitud
        method = request.method
        path = request.url.path

        # Procesar solicitud
        try:
            response: Response = await call_next(request)

            # Calcular duración
            duration = (time.time() - start_time) * 1000  # Convertir a ms

            # Determinar color según el código de estado
            status_code = response.status_code
            if status_code < 300:
                # Éxito - Verde
                color = Fore.GREEN
                symbol = "✓"
            elif status_code < 400:
                # Redirección - Cian
                color = Fore.CYAN
                symbol = "→"
            elif status_code < 500:
                # Error del cliente - Amarillo
                color = Fore.YELLOW
                symbol = "⚠"
            else:
                # Error del servidor - Rojo
                color = Fore.RED
                symbol = "✗"

            # Formatear el mensaje de registro
            log_message = (
                f"{color}{symbol} {method:7} {path:40} "
                f"Status: {status_code} "
                f"Duration: {duration:.2f}ms{Style.RESET_ALL}"
            )

            # Registro basado en código de estado
            if status_code >= 500:
                logger.error(log_message)
            elif status_code >= 400:
                logger.warning(log_message)
            else:
                logger.info(log_message)

            return response

        except Exception as e:
            # Registra el error en rojo
            duration = (time.time() - start_time) * 1000
            error_message = (
                f"{Fore.RED}✗ {method:7} {path:40} "
                f"ERROR: {str(e)} "
                f"Duration: {duration:.2f}ms{Style.RESET_ALL}"
            )
            logger.error(error_message)
            raise
