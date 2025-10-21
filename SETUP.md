# Guía de Configuración MapIT

## Configuración Inicial Completa

### 1. Obtener API Key de Gemini

1. Visita [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

### 2. Configuración del Proyecto

```bash
# Clonar repositorio
git clone <repository-url>
cd mapit

# Crear archivo .env en la raíz
echo "GEMINI_API_KEY=tu-api-key-aqui" > .env

# Iniciar servicios
docker-compose up --build
```

### 3. Verificar Servicios

Después de iniciar Docker Compose, verifica:

✅ **PostgreSQL**: `docker ps` - debe mostrar contenedor `db` saludable  
✅ **Backend**: Visita http://localhost:8000/health  
✅ **Frontend**: Visita http://localhost:5173  
✅ **API Docs**: Visita http://localhost:8000/docs  

### 4. Crear Primera Cuenta

1. Abre http://localhost:5173
2. Haz clic en "Registrarse"
3. Completa el formulario
4. Inicia sesión con tus credenciales

### 5. Subir Primer PDF

1. Ve al Dashboard
2. Selecciona un PDF (máximo 10MB)
3. Espera mientras la IA procesa el documento
4. ¡Explora tu mapa mental!

## Desarrollo Local

### Backend (sin Docker)

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
# Editar .env con tus credenciales

# Iniciar PostgreSQL localmente (o usar Docker)
docker run -d \
  -e POSTGRES_USER=mapit_user \
  -e POSTGRES_PASSWORD=mapit_password \
  -e POSTGRES_DB=mapit_db \
  -p 5432:5432 \
  postgres:16-alpine

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (sin Docker)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar .env
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Iniciar servidor de desarrollo
npm run dev
```

## Solución de Problemas

### Error: "Connection refused" al backend

**Causa:** El backend no está ejecutándose  
**Solución:** 
```bash
docker-compose up backend
```

### Error: "Invalid API key" de Gemini

**Causa:** API key incorrecta o no configurada  
**Solución:**
1. Verifica que `GEMINI_API_KEY` esté en el archivo `.env`
2. Verifica que la API key sea válida
3. Reinicia los contenedores: `docker-compose restart`

### Error: Database connection failed

**Causa:** PostgreSQL no está disponible  
**Solución:**
```bash
# Reiniciar solo la base de datos
docker-compose restart db

# Ver logs de la base de datos
docker-compose logs db
```

### Frontend no carga

**Causa:** Problemas de dependencias o configuración  
**Solución:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Migraciones no aplicadas

**Solución:**
```bash
cd backend
docker-compose exec backend alembic upgrade head
```

## Comandos Útiles

### Docker

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Reconstruir contenedores
docker-compose up --build
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec db psql -U mapit_user -d mapit_db

# Backup de base de datos
docker-compose exec db pg_dump -U mapit_user mapit_db > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U mapit_user mapit_db < backup.sql

# Ver tablas
docker-compose exec db psql -U mapit_user -d mapit_db -c "\dt"
```

### Alembic (Migraciones)

```bash
# Crear nueva migración
docker-compose exec backend alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
docker-compose exec backend alembic upgrade head

# Ver historial de migraciones
docker-compose exec backend alembic history

# Revertir última migración
docker-compose exec backend alembic downgrade -1
```

## Variables de Entorno

### Backend (.env o docker-compose.yml)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql+asyncpg://user:pass@host:5432/db` |
| `SECRET_KEY` | Clave secreta para JWT | Generar con `openssl rand -hex 32` |
| `GEMINI_API_KEY` | API key de Google Gemini | `AIza...` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:5173` |
| `ALGORITHM` | Algoritmo de JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de expiración del token | `30` |

### Frontend (.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend API | `http://localhost:8000/api` |

## Producción

Para despliegue en producción, ver el archivo principal README.md, sección "Despliegue en Render".

### Checklist Pre-Producción

- [ ] Cambiar `SECRET_KEY` a un valor seguro aleatorio
- [ ] Configurar `DATABASE_URL` de producción
- [ ] Validar `GEMINI_API_KEY` funciona
- [ ] Configurar CORS con `FRONTEND_URL` correcto
- [ ] Ejecutar todas las migraciones
- [ ] Probar autenticación
- [ ] Probar upload de PDF
- [ ] Verificar generación de mapas mentales
- [ ] Verificar generación de flashcards
- [ ] Probar el juego de reordenamiento

## Recursos Adicionales

- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Documentación React](https://react.dev/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [React Flow Docs](https://reactflow.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

