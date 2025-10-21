# 🐳 Logging con Colores en Docker

Esta guía explica cómo ver logs coloridos cuando ejecutas MapIT con Docker Compose.

## 🎨 Configuración para Colores en Docker

### Cambios Realizados

Para habilitar colores en Docker Compose, se han realizado los siguientes cambios:

#### 1. **docker-compose.yml**

Se agregaron las siguientes configuraciones a los servicios `backend` y `frontend`:

```yaml
backend:
  # ... otras configuraciones
  environment:
    PYTHONUNBUFFERED: 1    # Desactiva el buffering de Python
    FORCE_COLOR: 1         # Fuerza el uso de colores
  tty: true                # Asigna un pseudo-TTY
  stdin_open: true         # Mantiene STDIN abierto

frontend:
  # ... otras configuraciones
  environment:
    FORCE_COLOR: 1         # Fuerza el uso de colores
  tty: true                # Asigna un pseudo-TTY
  stdin_open: true         # Mantiene STDIN abierto
```

#### 2. **backend/app/utils/logger.py**

Se modificó la inicialización de colorama para forzar colores:

```python
# strip=False fuerza colores incluso cuando no hay TTY
init(autoreset=True, strip=False)
```

## 🚀 Cómo Ver los Logs con Colores

### Opción 1: Ver todos los logs

```bash
docker-compose up
```

Verás logs coloridos de todos los servicios mezclados.

### Opción 2: Ver logs de un servicio específico

```bash
# Solo backend
docker-compose up backend

# Solo frontend
docker-compose up frontend

# Backend y frontend
docker-compose up backend frontend
```

### Opción 3: Ejecutar en background y ver logs después

```bash
# Iniciar servicios en background
docker-compose up -d

# Ver logs del backend (con seguimiento en tiempo real)
docker-compose logs -f backend

# Ver logs del frontend (con seguimiento en tiempo real)
docker-compose logs -f frontend

# Ver logs de todos los servicios
docker-compose logs -f
```

### Opción 4: Ver logs con timestamps

```bash
docker-compose logs -f -t backend
```

## 📋 Ejemplos de Salida Colorida

### Backend
```
backend_1   | INFO:     ✓ MapIT API iniciada correctamente - Servidor corriendo
backend_1   | INFO:     ✓ POST    /api/auth/login      Status: 200  Duration: 245.32ms
backend_1   | WARNING:  ⚠ GET     /api/flashcards/999  Status: 404  Duration: 12.45ms
backend_1   | ERROR:    ✗ POST    /api/mind-maps       Status: 500  Duration: 523.78ms
```

### Frontend
Los logs del frontend aparecen en la consola del contenedor, pero los logs más útiles estarán en la **consola del navegador** (F12).

## 🔧 Solución de Problemas

### No veo colores después de los cambios

1. **Reconstruir las imágenes:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

2. **Verificar que estás usando una terminal compatible:**
   - Windows: Usa PowerShell, Windows Terminal o Git Bash (no CMD antiguo)
   - Mac/Linux: La mayoría de terminales soportan colores ANSI

3. **Verificar variables de entorno:**
```bash
docker-compose exec backend env | grep FORCE_COLOR
# Debería mostrar: FORCE_COLOR=1
```

### Los colores aparecen como códigos ANSI

Si ves algo como `[32m✓[0m` en lugar de colores:

- **Tu terminal no soporta colores ANSI**
- Soluciones:
  - Windows: Usa Windows Terminal o PowerShell 7+
  - Actualiza tu cliente de terminal
  - Usa `docker-compose logs --no-color` para desactivar códigos de color

### Ver logs sin colores (si prefieres)

```bash
docker-compose logs --no-color -f backend
```

## 📊 Comandos Útiles

```bash
# Ver últimas 100 líneas con colores
docker-compose logs --tail=100 -f backend

# Ver logs desde un tiempo específico
docker-compose logs --since="2025-10-21T10:00:00" backend

# Ver logs hasta cierta cantidad
docker-compose logs --tail=50 backend

# Filtrar logs (usando grep, pero perderás los colores)
docker-compose logs backend 2>&1 | grep ERROR

# Guardar logs a un archivo (sin colores)
docker-compose logs --no-color backend > backend_logs.txt
```

## 🎯 Mejores Prácticas

1. **Durante el desarrollo:**
   - Usa `docker-compose up` para ver todo en tiempo real
   - Abre otra terminal para ejecutar comandos

2. **Para debugging:**
   - Usa `docker-compose logs -f backend` en una terminal
   - Haz peticiones desde el frontend
   - Observa los logs coloridos en tiempo real

3. **En producción:**
   - Usa `docker-compose up -d` para ejecutar en background
   - Usa herramientas de logging centralizadas
   - Los colores pueden desactivarse si no son necesarios

## 🌈 Códigos de Color en Docker

Los colores funcionan exactamente igual que en ejecución local:

| Tipo | Color | Símbolo |
|------|-------|---------|
| Éxito (200-299) | 🟢 Verde | ✓ |
| Info/Redirect (300-399) | 🔵 Cyan | → |
| Warning/Client Error (400-499) | 🟡 Amarillo | ⚠ |
| Error/Server Error (500+) | 🔴 Rojo | ✗ |

## 🔗 Referencias

- [Docker Compose Logs Documentation](https://docs.docker.com/compose/reference/logs/)
- [Colorama Documentation](https://pypi.org/project/colorama/)
- Ver también: [LOGGING.md](LOGGING.md) para más información sobre el sistema de logging

