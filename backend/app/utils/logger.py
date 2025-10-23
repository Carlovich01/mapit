"""
Utilidad de logging de colores para la aplicación.
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
    """Formateador personalizado que añade colores a los mensajes de log."""

    COLORS = {
        "DEBUG": Fore.CYAN,
        "INFO": Fore.GREEN,
        "WARNING": Fore.YELLOW,
        "ERROR": Fore.RED,
        "CRITICAL": Fore.RED + Back.WHITE,
    }

    def format(self, record):
        # Añade color al nombre del nivel
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{Style.RESET_ALL}"

        # Formatear el mensaje
        result = super().format(record)

        # Restablecer color al final
        return result


def setup_logger(name: str = "mapit") -> logging.Logger:
    """
    Configurar un logger con salida en color.

    Args:
        name: Nombre del logger

    Returns:
        Instancia de logger configurada
    """
    logger = logging.getLogger(name)

    # Solo agregue el controlador si aún no está configurado
    if not logger.handlers:
        logger.setLevel(logging.INFO)

        # Crear controlador de consola
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)

        # Crear formateador con colores
        formatter = ColoredFormatter(
            "%(levelname)s:     %(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
        )

        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


def log_success(message: str, logger: logging.Logger = None):
    """Registrar un mensaje de éxito en verde."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.info(f"{Fore.GREEN}✓ {message}{Style.RESET_ALL}")


def log_error(message: str, logger: logging.Logger = None):
    """Registrar un mensaje de error en rojo."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.error(f"{Fore.RED}✗ {message}{Style.RESET_ALL}")


def log_warning(message: str, logger: logging.Logger = None):
    """Registrar un mensaje de advertencia en amarillo."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.warning(f"{Fore.YELLOW}⚠ {message}{Style.RESET_ALL}")


def log_info(message: str, logger: logging.Logger = None):
    """Registrar un mensaje de info en azul."""
    if logger is None:
        logger = logging.getLogger("mapit")
    logger.info(f"{Fore.CYAN}ℹ {message}{Style.RESET_ALL}")
