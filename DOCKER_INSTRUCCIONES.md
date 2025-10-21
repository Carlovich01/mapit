# 🐳 Instrucciones para Ver Colores en Docker Compose

## ✅ Cambios Realizados

Se han aplicado los siguientes cambios para habilitar colores en Docker Compose:

### 1. **docker-compose.yml** ✓
- Agregado `tty: true` a backend y frontend
- Agregado `stdin_open: true` a backend y frontend
- Agregado `PYTHONUNBUFFERED: 1` al backend
- Agregado `FORCE_COLOR: 1` a backend y frontend

### 2. **backend/app/utils/logger.py** ✓
- Modificado `init(autoreset=True, strip=False)` para forzar colores

## 🚀 Cómo Usar

### Opción 1: Ver logs en tiempo real (RECOMENDADO)

```bash
# Detener contenedores actuales si están corriendo
docker-compose down

# Iniciar con logs visibles
docker-compose up
```

Ahora deberías ver logs coloridos:
- 🟢 **Verde** para peticiones exitosas (200-299)
- 🟡 **Amarillo** para errores del cliente (400-499)
- 🔴 **Rojo** para errores del servidor (500+)

### Opción 2: Background + seguimiento de logs

```bash
# Iniciar en background
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# O ver logs del frontend
docker-compose logs -f frontend

# O ver todos
docker-compose logs -f
```

### Opción 3: Reconstruir si no ves colores

Si ya tenías contenedores corriendo y no ves colores:

```bash
# Detener todo
docker-compose down

# Reconstruir las imágenes
docker-compose build --no-cache

# Iniciar de nuevo
docker-compose up
```

## 📋 Scripts Helper (Opcional)

Se han creado scripts para facilitar el acceso a logs:

### Linux/Mac:
```bash
# Dar permisos de ejecución (solo primera vez)
chmod +x docker-logs.sh

# Ejecutar
./docker-logs.sh

# O especificar servicio directamente
./docker-logs.sh backend
```

### Windows (PowerShell):
```powershell
# Ejecutar
.\docker-logs.ps1

# O especificar servicio directamente
.\docker-logs.ps1 backend
```

## 🔍 Verificar que Funciona

1. **Inicia los contenedores:**
```bash
docker-compose up
```

2. **Deberías ver algo como:**
```
backend_1   | INFO:     ✓ MapIT API iniciada correctamente - Servidor corriendo
backend_1   | INFO:     Documentación disponible en: http://localhost:8000/docs
```

3. **Haz una petición HTTP** (por ejemplo, desde el frontend o con curl):
```bash
curl http://localhost:8000/health
```

4. **Deberías ver en los logs:**
```
backend_1   | INFO:     ✓ GET     /health      Status: 200  Duration: 5.23ms
```

## ❗ Solución de Problemas

### No veo colores

**Solución 1: Reconstruir**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Solución 2: Verificar variables de entorno**
```bash
docker-compose exec backend env | grep FORCE
# Debe mostrar: FORCE_COLOR=1
```

**Solución 3: Verificar tu terminal**
- Windows: Usa PowerShell 7+ o Windows Terminal (no CMD viejo)
- Mac/Linux: La mayoría de terminales modernas soportan colores

### Veo códigos ANSI en lugar de colores

Si ves cosas como `[32m✓[0m` en lugar de colores:

- Tu terminal no soporta colores ANSI
- Actualiza a una terminal moderna:
  - Windows: [Windows Terminal](https://aka.ms/terminal)
  - Mac: Terminal.app o iTerm2
  - Linux: Gnome Terminal, Konsole, etc.

### Los logs están mezclados

Esto es normal cuando usas `docker-compose up` sin especificar servicio.

**Soluciones:**
```bash
# Solo backend
docker-compose up backend

# Solo frontend
docker-compose up frontend

# Tabs separadas
docker-compose up -d
docker-compose logs -f backend  # En terminal 1
docker-compose logs -f frontend # En terminal 2
```

## 📊 Ejemplo de Sesión Completa

```bash
# 1. Detener contenedores anteriores
docker-compose down

# 2. Iniciar con logs visibles
docker-compose up

# Verás:
# db_1        | ... logs de postgres ...
# backend_1   | INFO:     ✓ MapIT API iniciada correctamente
# frontend_1  | VITE v... ready in ... ms
# backend_1   | INFO:     ✓ GET /api/health Status: 200 Duration: 5ms

# 3. En otra terminal, puedes hacer peticiones
curl http://localhost:8000/api/health

# 4. Verás en la primera terminal:
# backend_1   | INFO:     ✓ GET /api/health Status: 200 Duration: 5ms
```

## 🎯 Tips

1. **Usa `docker-compose up` sin `-d`** durante desarrollo para ver logs en tiempo real
2. **Abre múltiples terminales** si quieres ver logs de diferentes servicios
3. **El frontend muestra logs básicos** en Docker, los logs importantes están en la consola del navegador (F12)
4. **Usa `Ctrl+C`** para detener los contenedores cuando uses `docker-compose up`

## 📚 Más Información

- [DOCKER_LOGGING.md](DOCKER_LOGGING.md) - Documentación completa de logging en Docker
- [LOGGING.md](LOGGING.md) - Documentación del sistema de logging
- [LOGGING_QUICK_START.md](LOGGING_QUICK_START.md) - Guía rápida

---

¡Disfruta de tus logs coloridos en Docker! 🎨🐳

