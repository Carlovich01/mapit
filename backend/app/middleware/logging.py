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
    """Middleware to log HTTP requests and responses with colors."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        """
        Process the request and log it with appropriate colors.

        Args:
            request: The incoming request
            call_next: The next middleware/endpoint to call

        Returns:
            Response object
        """
        # Start timer
        start_time = time.time()

        # Get request details
        method = request.method
        path = request.url.path

        # Process request
        try:
            response: Response = await call_next(request)

            # Calculate duration
            duration = (time.time() - start_time) * 1000  # Convert to ms

            # Determine color based on status code
            status_code = response.status_code
            if status_code < 300:
                # Success - Green
                color = Fore.GREEN
                symbol = "✓"
            elif status_code < 400:
                # Redirect - Cyan
                color = Fore.CYAN
                symbol = "→"
            elif status_code < 500:
                # Client error - Yellow
                color = Fore.YELLOW
                symbol = "⚠"
            else:
                # Server error - Red
                color = Fore.RED
                symbol = "✗"

            # Format the log message
            log_message = (
                f"{color}{symbol} {method:7} {path:40} "
                f"Status: {status_code} "
                f"Duration: {duration:.2f}ms{Style.RESET_ALL}"
            )

            # Log based on status code
            if status_code >= 500:
                logger.error(log_message)
            elif status_code >= 400:
                logger.warning(log_message)
            else:
                logger.info(log_message)

            return response

        except Exception as e:
            # Log the error in red
            duration = (time.time() - start_time) * 1000
            error_message = (
                f"{Fore.RED}✗ {method:7} {path:40} "
                f"ERROR: {str(e)} "
                f"Duration: {duration:.2f}ms{Style.RESET_ALL}"
            )
            logger.error(error_message)
            raise
