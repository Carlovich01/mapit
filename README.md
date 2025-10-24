# MapIT

**MapIT** es una aplicación web educativa que transforma documentos PDF en herramientas de aprendizaje interactivas mediante Inteligencia Artificial.

## Características

### 1. 📊 Mapas Mentales IA
- Sube un PDF y obtén automáticamente un mapa mental interactivo
- Visualización dinámica con React Flow y d3-force
- Nodos y conexiones organizados jerárquicamente

### 2. 🎴 Flashcards con Repetición Espaciada
- Generación automática de flashcards desde el PDF
- Implementación del algoritmo SM-2 para optimizar el aprendizaje
- Sistema de revisión inteligente

### 3. 🎮 Juego de Reordenamiento
- Modo de juego interactivo
- Reorganiza y conecta nodos del mapa mental
- Sistema de puntuación basado en precisión

### 4. 🎨 Sistema de Logging con Colores
- Logs coloridos en consola para backend (terminal) y frontend (navegador)
- 🟢 Verde para peticiones exitosas (200-299)
- 🔴 Rojo para errores (400+)
- Tracking automático de todas las peticiones HTTP con duración
- ✅ Funciona en desarrollo local y Docker Compose
- Ver [LOGGING.md](LOGGING.md) o [DOCKER_INSTRUCCIONES.md](DOCKER_INSTRUCCIONES.md) para más detalles

## Stack Tecnológico

### Backend
- **Framework:** FastAPI 0.115+ (Python 3.12+)
- **Base de Datos:** PostgreSQL 16+ con SQLAlchemy 2.0 (asyncio)
- **IA:** Google Gemini 2.5 Flash
- **Procesamiento PDF:** PyMuPDF (en memoria)
- **Autenticación:** JWT (python-jose)

### Frontend
- **Framework:** React 19.1.1 + TypeScript
- **Build Tool:** Vite 7
- **Compilador:** SWC
- **UI:** shadcn/ui + Tailwind CSS
- **Routing:** React Router DOM 7
- **State:** Zustand
- **HTTP:** Axios
- **Visualización:** React Flow + d3-hierarchy

### DevOps
- **Contenedores:** Docker + Docker Compose
- **Despliegue:** Render (configurado)

## Estructura del Proyecto

```
mapit/
├── backend/
│   ├── app/
│   │   ├── api/          # Endpoints (auth, mind_maps, flashcards, game)
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── schemas/      # Esquemas Pydantic
│   │   ├── services/     # Lógica de negocio
│   │   ├── utils/        # Utilidades (JWT, validación)
│   │   ├── config.py     # Configuración
│   │   ├── database.py   # Configuración DB
│   │   └── main.py       # Aplicación FastAPI
│   ├── alembic/          # Migraciones
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── services/     # Servicios API
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── types/        # Tipos TypeScript
│   │   ├── utils/        # Utilidades
│   │   ├── lib/          # shadcn utils
│   │   └── App.tsx       # Router principal
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml
```

## Inicio Rápido

### Prerequisitos

- Docker y Docker Compose
- API Key de Google Gemini

### Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd mapit
   ```

2. **Crear archivo `.env`** en la raíz del proyecto:
   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```

### Despliegue

#### 🔧 Modo Desarrollo (con hot-reload)

Para desarrollo activo con recarga automática:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Características:**
- ⚡ Hot-reload en backend y frontend
- 🔄 Cambios de código se reflejan automáticamente
- 📝 Volúmenes montados para edición en tiempo real

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Adminer (DB): http://localhost:8080

#### 🚀 Modo Producción Local (optimizado)

Para pruebas en un entorno similar a producción:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

**Características:**
- ✅ Frontend compilado con `npm run build`
- ✅ Archivos estáticos servidos por Nginx
- ✅ Backend con `fastapi run` (sin reload)
- ✅ Compresión gzip y cache de assets
- ✅ Mejor rendimiento y menor uso de recursos

**URLs:**
- Aplicación completa: http://localhost:8080
- Backend API: http://localhost:8000

### Comandos Útiles

```bash
# Detener servicios
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f backend

# Reconstruir un servicio específico
docker-compose -f docker-compose.dev.yml up --build backend
docker-compose -f docker-compose.prod.yml up --build frontend

# Eliminar volúmenes (resetear base de datos)
docker-compose -f docker-compose.dev.yml down -v
```

2. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz:
   ```env
   GEMINI_API_KEY=tu-api-key-de-gemini
   ```

3. **Iniciar con Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Desarrollo Local (sin Docker)

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Iniciar servidor de desarrollo
npm run dev
```

## Base de Datos

### Esquema Principal

- **users:** Usuarios de la aplicación
- **mind_maps:** Mapas mentales generados
- **mind_map_nodes:** Nodos del mapa
- **mind_map_edges:** Conexiones entre nodos
- **flashcards:** Tarjetas de estudio
- **flashcard_progress:** Progreso SM-2 del usuario
- **game_sessions:** Sesiones de juego

### Migraciones

```bash
# Crear nueva migración
cd backend
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión (OAuth2)
- `GET /api/auth/me` - Obtener usuario actual

### Mapas Mentales
- `POST /api/mind-maps` - Subir PDF y crear mapa
- `GET /api/mind-maps` - Listar mapas del usuario
- `GET /api/mind-maps/{id}` - Obtener mapa específico

### Flashcards
- `GET /api/flashcards/mind-maps/{id}/flashcards` - Obtener flashcards
- `POST /api/flashcards/{id}/review` - Revisar flashcard
- `GET /api/flashcards/due` - Flashcards pendientes

### Juego
- `POST /api/game/sessions` - Crear sesión de juego
- `PUT /api/game/sessions/{id}` - Completar sesión
- `GET /api/game/sessions` - Listar sesiones

## Despliegue en Render

### Backend

1. Crear nuevo Web Service
2. Conectar repositorio
3. Configurar:
   - Build Command: `pip install -r requirements.txt && alembic upgrade head`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Variables de entorno:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL`

### Frontend

1. Crear nuevo Static Site
2. Configurar:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. Variable de entorno:
   - `VITE_API_URL`: URL del backend

### Base de Datos

1. Crear PostgreSQL Database en Render
2. Copiar la URL de conexión interna
3. Agregar a variables de entorno del backend

## Algoritmos

### SM-2 (Repetición Espaciada)

El sistema implementa el algoritmo SuperMemo 2 para optimizar la revisión de flashcards:

- **Calidad (0-5):** Nivel de recordación
- **Factor de Facilidad (EF):** Dificultad de la tarjeta
- **Intervalo:** Días hasta próxima revisión
- **Repeticiones:** Veces revisada correctamente

### Validación de Grafo

Para el juego de reordenamiento:
- Comparación de estructura de aristas
- Normalización para grafo no dirigido
- Puntuación basada en precisión (0-100%)

## Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
