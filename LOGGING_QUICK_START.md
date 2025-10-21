# 🚀 Inicio Rápido - Sistema de Logging con Colores

## 📦 Instalación

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Esto instalará `colorama==0.4.6` junto con las otras dependencias.

### Frontend

No requiere instalación adicional, ya que usa características nativas de CSS en la consola del navegador.

## 🧪 Pruebas

### Probar Backend

1. **Ejecutar el script de prueba:**
```bash
cd backend
python test_logging.py
```

Verás una demostración de todos los tipos de logs con colores en la terminal.

2. **Ejecutar el servidor:**
```bash
cd backend
uvicorn app.main:app --reload
```

Verás logs coloridos automáticamente cuando:
- El servidor inicie (mensaje verde de éxito)
- Se realicen peticiones HTTP (colores según el código de estado)

### Probar Frontend

1. **Abrir el archivo de prueba:**
   - Abre `frontend/test_logging.html` en tu navegador
   - Abre la consola de desarrollador (F12)
   - Haz clic en los botones para ver diferentes tipos de logs

2. **En tu aplicación React:**
   - Ejecuta el frontend normalmente
   - Abre la consola del navegador
   - Realiza peticiones a la API (login, crear mapa mental, etc.)
   - Verás logs coloridos automáticamente

## 📊 Ejemplo de Uso en Desarrollo

### Terminal (Backend)
```bash
# Iniciar el servidor
uvicorn app.main:app --reload

# Verás algo como:
INFO:     2025-10-21 10:30:45 - ✓ MapIT API iniciada correctamente
INFO:     2025-10-21 10:30:50 - ✓ POST /api/auth/login Status: 200 Duration: 245ms
```

### Consola del Navegador (Frontend)
```javascript
// Los logs se generan automáticamente con cada petición HTTP
// También puedes usar manualmente:
import logger from './utils/logger';

logger.success('Datos guardados'); // Verde
logger.error('Error al guardar');  // Rojo
logger.warning('Token expirando'); // Amarillo
logger.info('Cargando...');        // Azul
```

## 🎨 Códigos de Color

| Tipo | Backend (Terminal) | Frontend (Consola) |
|------|-------------------|-------------------|
| Éxito (200-299) | 🟢 Verde | 🟢 Verde |
| Info/Redirect (300-399) | 🔵 Cyan | 🔵 Azul |
| Warning/Client Error (400-499) | 🟡 Amarillo | 🟡 Amarillo |
| Error/Server Error (500+) | 🔴 Rojo | 🔴 Rojo |

## 🐳 Con Docker Compose

Si usas Docker Compose, los colores ya están configurados:

```bash
# Iniciar con logs visibles
docker-compose up

# O en background y ver logs después
docker-compose up -d
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Configuración aplicada:**
- ✅ `tty: true` - Asigna pseudo-TTY
- ✅ `FORCE_COLOR=1` - Fuerza colores
- ✅ `PYTHONUNBUFFERED=1` - Desactiva buffering (backend)

Ver [DOCKER_LOGGING.md](DOCKER_LOGGING.md) para solución de problemas con Docker.

## 📝 Notas

- ✅ El logging funciona **automáticamente** para todas las peticiones HTTP
- ✅ No requiere configuración adicional después de la instalación
- ✅ Compatible con Windows, Linux y macOS
- ✅ Los colores funcionan en terminales modernas, navegadores web y Docker
- ✅ En Docker Compose, usa `docker-compose up` (sin `-d`) para ver logs coloridos

## 🔗 Más Información

- Ver [LOGGING.md](LOGGING.md) para documentación completa y opciones de personalización
- Ver [DOCKER_LOGGING.md](DOCKER_LOGGING.md) para información específica de Docker

