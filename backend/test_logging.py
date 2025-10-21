"""
Script de prueba para demostrar el sistema de logging con colores.
Ejecutar con: python test_logging.py
"""

import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.logger import setup_logger, log_success, log_error, log_warning, log_info

# Configurar el logger
logger = setup_logger("test")

print("\n" + "=" * 70)
print("🎨 DEMOSTRACIÓN DEL SISTEMA DE LOGGING CON COLORES")
print("=" * 70 + "\n")

# Ejemplos de logs básicos
print("📝 Logs Básicos:\n")
log_success("Operación completada exitosamente")
log_info("Información general del sistema")
log_warning("Advertencia: Verifica los datos de entrada")
log_error("Error al procesar la solicitud")

print("\n" + "-" * 70 + "\n")

# Ejemplos de niveles de log
print("📊 Diferentes Niveles de Log:\n")
logger.debug("Mensaje de debug (no se muestra por defecto)")
logger.info("Mensaje informativo")
logger.warning("Mensaje de advertencia")
logger.error("Mensaje de error")
logger.critical("Mensaje crítico")

print("\n" + "-" * 70 + "\n")

# Simular logs de peticiones HTTP
print("🌐 Simulación de Peticiones HTTP:\n")
log_success("GET /api/mind-maps - Status: 200 - Duration: 45.23ms")
log_success("POST /api/auth/login - Status: 201 - Duration: 123.45ms")
log_warning("GET /api/flashcards/999 - Status: 404 - Duration: 12.34ms")
log_error("POST /api/mind-maps - Status: 500 - Duration: 234.56ms")

print("\n" + "=" * 70)
print("✅ Prueba de logging completada")
print("=" * 70 + "\n")
