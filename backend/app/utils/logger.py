"""
Colored logging utility for the application.
"""

import logging
import sys
import os
from datetime import datetime
from colorama import Fore, Back, Style, init

# Initialize colorama for Windows support and force colors in Docker
# strip=False forces colors even when not in a TTY
init(autoreset=True, strip=False)


class ColoredFormatter(logging.Formatter):
    """Custom formatter that adds colors to log messages."""

    COLORS = {
        "DEBUG": Fore.CYAN,
        "INFO": Fore.GREEN,
        "WARNING": Fore.YELLOW,
        "ERROR": Fore.RED,
        "CRITICAL": Fore.RED + Back.WHITE,
    }

    def format(self, record):
        # Add color to the level name
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{Style.RESET_ALL}"

        # Format the message
        result = super().format(record)

        # Reset color at the end
        return result


def setup_logger(name: str = "mapit") -> logging.Logger:
    """
    Set up a logger with colored output.

    Args:
        name: Logger name

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Only add handler if not already configured
    if not logger.handlers:
        logger.setLevel(logging.INFO)

        # Create console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)

        # Create formatter with colors
        formatter = ColoredFormatter(
            "%(levelname)s:     %(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
        )

        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


def log_success(message: str, logger: logging.Logger = None):
    """Log a success message in green."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.info(f"{Fore.GREEN}✓ {message}{Style.RESET_ALL}")


def log_error(message: str, logger: logging.Logger = None):
    """Log an error message in red."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.error(f"{Fore.RED}✗ {message}{Style.RESET_ALL}")


def log_warning(message: str, logger: logging.Logger = None):
    """Log a warning message in yellow."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.warning(f"{Fore.YELLOW}⚠ {message}{Style.RESET_ALL}")


def log_info(message: str, logger: logging.Logger = None):
    """Log an info message in blue."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.info(f"{Fore.CYAN}ℹ {message}{Style.RESET_ALL}")
