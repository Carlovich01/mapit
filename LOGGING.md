# 🎨 Sistema de Logging con Colores

Este proyecto incluye un sistema de logging con colores tanto para el backend como para el frontend, facilitando la identificación visual de peticiones exitosas y errores.

## 📋 Tabla de Contenidos
- [Backend (Python/FastAPI)](#backend-pythonfastapi)
- [Frontend (TypeScript/React)](#frontend-typescriptreact)
- [Códigos de Color](#códigos-de-color)
- [Instalación](#instalación)

---

## 🐍 Backend (Python/FastAPI)

### Configuración

El backend utiliza `colorama` para colorear los logs en la consola. El middleware de logging se encarga automáticamente de registrar todas las peticiones HTTP.

### Características

- ✅ **Logging automático** de todas las peticiones HTTP
- 🎨 **Colores basados en código de estado**:
  - 🟢 Verde (200-299): Peticiones exitosas
  - 🔵 Cyan (300-399): Redirecciones
  - 🟡 Amarillo (400-499): Errores del cliente
  - 🔴 Rojo (500+): Errores del servidor
- ⏱️ **Duración** de cada petición en milisegundos
- 📝 **Formato estructurado** con método, ruta, estado y duración

### Uso Manual

Puedes usar el logger manualmente en cualquier parte del código:

```python
from app.utils.logger import log_success, log_error, log_warning, log_info

# Logs con colores
log_success("Operación completada exitosamente")
log_error("Ha ocurrido un error")
log_warning("Advertencia: Verifica los datos")
log_info("Información adicional")
```

### Ejemplo de Salida en Consola

```
INFO:     2025-10-21 10:30:45 - ✓ MapIT API iniciada correctamente - Servidor corriendo
INFO:     2025-10-21 10:30:45 - Documentación disponible en: http://localhost:8000/docs
INFO:     2025-10-21 10:30:50 - ✓ POST    /api/auth/login                          Status: 200 Duration: 245.32ms
INFO:     2025-10-21 10:30:52 - ✓ GET     /api/mind-maps                           Status: 200 Duration: 89.15ms
WARNING:  2025-10-21 10:30:55 - ⚠ GET     /api/flashcards/999                      Status: 404 Duration: 12.45ms
ERROR:    2025-10-21 10:31:00 - ✗ POST    /api/mind-maps                           Status: 500 Duration: 523.78ms
```

### Archivos Principales

- `backend/app/utils/logger.py`: Configuración del logger con colores
- `backend/app/middleware/logging.py`: Middleware para logging HTTP
- `backend/app/main.py`: Integración del middleware

---

## ⚛️ Frontend (TypeScript/React)

### Configuración

El frontend usa estilos CSS en la consola del navegador para colorear los logs.

### Características

- 🎨 **Colores automáticos** basados en el código de estado HTTP
- 📊 **Información detallada** de errores con grupos colapsables
- ⏱️ **Medición de duración** de peticiones
- 🔍 **Logging de requests y responses**
- 📝 **Formato legible** con timestamps

### Uso Manual

```typescript
import logger from '../utils/logger';

// Logs básicos
logger.success('Datos guardados correctamente');
logger.error('Error al procesar la solicitud');
logger.warning('El token expirará pronto');
logger.info('Cargando datos...');

// Logger por módulo
const moduleLogger = logger.create('MindMap');
moduleLogger.success('Mapa mental creado');
moduleLogger.error('Error al cargar el mapa');
```

### Ejemplo de Salida en Consola del Navegador

```
→ [10:30:50] POST /auth/login
✓ [10:30:50] POST /auth/login - Status: 200 (245ms)
→ [10:30:52] GET /mind-maps
✓ [10:30:52] GET /mind-maps - Status: 200 (89ms)
→ [10:30:55] GET /flashcards/999
⚠ [10:30:55] GET /flashcards/999 - Status: 404 (12ms)
→ [10:31:00] POST /mind-maps
✗ [10:31:00] POST /mind-maps - ERROR (523ms)
  ▼ Error details: {...}
    Response data: {...}
    Response status: 500
    Response headers: {...}
```

### Archivos Principales

- `frontend/src/utils/logger.ts`: Utilidad de logging con colores
- `frontend/src/services/api.ts`: Interceptores de axios con logging

---

## 🎨 Códigos de Color

### Backend (Terminal)

| Código Estado | Color | Símbolo | Nivel |
|--------------|-------|---------|-------|
| 200-299 | 🟢 Verde | ✓ | INFO |
| 300-399 | 🔵 Cyan | → | INFO |
| 400-499 | 🟡 Amarillo | ⚠ | WARNING |
| 500+ | 🔴 Rojo | ✗ | ERROR |

### Frontend (Consola del Navegador)

| Código Estado | Color | Símbolo |
|--------------|-------|---------|
| 200-299 | 🟢 Verde (#10b981) | ✓ |
| 300-399 | 🔵 Azul (#3b82f6) | ℹ |
| 400-499 | 🟡 Amarillo (#f59e0b) | ⚠ |
| 500+ | 🔴 Rojo (#ef4444) | ✗ |

---

## 🚀 Instalación

### Backend

1. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

2. El middleware ya está configurado en `main.py`, funcionará automáticamente al iniciar el servidor:
```bash
uvicorn app.main:app --reload
```

### Frontend

1. El logger ya está integrado en `api.ts`, funcionará automáticamente con todas las peticiones axios.

2. Para usarlo en otros componentes, simplemente impórtalo:
```typescript
import logger from './utils/logger';
```

### 🐳 Con Docker Compose

Los colores funcionan automáticamente en Docker Compose:

```bash
# Ver logs con colores
docker-compose up

# O en background
docker-compose up -d
docker-compose logs -f backend
```

**Nota:** Ver [DOCKER_LOGGING.md](DOCKER_LOGGING.md) para más detalles sobre logs con Docker.

---

## 📝 Notas Adicionales

- Los logs de peticiones HTTP se generan **automáticamente** gracias a los middleware e interceptores
- El logging **no afecta el rendimiento** de forma significativa
- Los colores funcionan tanto en terminales modernas como en la consola del navegador
- En Windows, `colorama` se inicializa automáticamente para soportar colores ANSI

## 🔧 Personalización

### Cambiar Colores del Backend

Edita `backend/app/utils/logger.py`:

```python
COLORS = {
    'DEBUG': Fore.CYAN,
    'INFO': Fore.GREEN,
    'WARNING': Fore.YELLOW,
    'ERROR': Fore.RED,
    'CRITICAL': Fore.RED + Back.WHITE,
}
```

### Cambiar Colores del Frontend

Edita `frontend/src/utils/logger.ts`:

```typescript
const styles: LogStyles = {
  success: 'color: #10b981; font-weight: bold; font-size: 12px;',
  error: 'color: #ef4444; font-weight: bold; font-size: 12px;',
  warning: 'color: #f59e0b; font-weight: bold; font-size: 12px;',
  info: 'color: #3b82f6; font-weight: bold; font-size: 12px;',
};
```

---

¡Disfruta de tus logs coloridos! 🌈

