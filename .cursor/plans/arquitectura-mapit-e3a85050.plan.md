<!-- e3a85050-c787-412f-af1d-cafd4cf95995 611245d2-3a73-44c4-bff4-a2e76cdadd46 -->
# Arquitectura MapIT - Plan Completo

## 1. Arquitectura General del Sistema

**Stack Tecnológico:**

- **Backend:** FastAPI 0.115+ (Python 3.12+), asíncrono al 100%
- **Frontend:** React 19.1.1 + TypeScript + Vite 7 + SWC (ya configurado en `frontend/`)
- **Base de Datos:** PostgreSQL 16+
- **ORM:** SQLAlchemy 2.0+ con asyncio + asyncpg
- **IA:** Google Generative AI SDK (Gemini 2.5 Flash) con llamadas asíncronas
- **Contenedores:** Docker + Docker Compose
- **Despliegue:** Render

## 2. Esquema de Base de Datos PostgreSQL

### Tablas principales:

```sql
-- Usuarios
users (
  id: UUID PRIMARY KEY,
  email: VARCHAR(255) UNIQUE NOT NULL,
  hashed_password: VARCHAR(255) NOT NULL,
  full_name: VARCHAR(255),
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)

-- Mapas mentales generados
mind_maps (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id) ON DELETE CASCADE,
  title: VARCHAR(500) NOT NULL,
  pdf_filename: VARCHAR(500),
  pdf_content_hash: VARCHAR(64), -- SHA-256 del contenido
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)

-- Nodos del mapa mental (estructura del grafo)
mind_map_nodes (
  id: UUID PRIMARY KEY,
  mind_map_id: UUID REFERENCES mind_maps(id) ON DELETE CASCADE,
  node_id: VARCHAR(100) NOT NULL, -- ID para React Flow
  label: TEXT NOT NULL,
  content: TEXT, -- Contenido ampliado del nodo
  position_x: FLOAT, -- Posición inicial calculada
  position_y: FLOAT,
  level: INTEGER DEFAULT 0, -- Nivel en la jerarquía (0=raíz)
  created_at: TIMESTAMP DEFAULT NOW(),
  UNIQUE(mind_map_id, node_id)
)

-- Conexiones entre nodos
mind_map_edges (
  id: UUID PRIMARY KEY,
  mind_map_id: UUID REFERENCES mind_maps(id) ON DELETE CASCADE,
  edge_id: VARCHAR(100) NOT NULL,
  source_node_id: VARCHAR(100) NOT NULL,
  target_node_id: VARCHAR(100) NOT NULL,
  created_at: TIMESTAMP DEFAULT NOW(),
  UNIQUE(mind_map_id, edge_id)
)

-- Flashcards generadas del PDF
flashcards (
  id: UUID PRIMARY KEY,
  mind_map_id: UUID REFERENCES mind_maps(id) ON DELETE CASCADE,
  question: TEXT NOT NULL,
  answer: TEXT NOT NULL,
  created_at: TIMESTAMP DEFAULT NOW()
)

-- Progreso del usuario en flashcards (algoritmo SM-2)
flashcard_progress (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id: UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  easiness_factor: FLOAT DEFAULT 2.5, -- EF en SM-2
  interval: INTEGER DEFAULT 0, -- Días hasta próxima revisión
  repetitions: INTEGER DEFAULT 0, -- Número de repeticiones correctas consecutivas
  next_review_date: DATE DEFAULT CURRENT_DATE,
  last_reviewed_at: TIMESTAMP,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
)

-- Progreso en el juego de reordenamiento
game_sessions (
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES users(id) ON DELETE CASCADE,
  mind_map_id: UUID REFERENCES mind_maps(id) ON DELETE CASCADE,
  score: INTEGER DEFAULT 0,
  completed: BOOLEAN DEFAULT FALSE,
  time_elapsed_seconds: INTEGER,
  created_at: TIMESTAMP DEFAULT NOW(),
  completed_at: TIMESTAMP
)

-- Índices para optimización
CREATE INDEX idx_mind_maps_user_id ON mind_maps(user_id);
CREATE INDEX idx_mind_map_nodes_map_id ON mind_map_nodes(mind_map_id);
CREATE INDEX idx_mind_map_edges_map_id ON mind_map_edges(mind_map_id);
CREATE INDEX idx_flashcards_map_id ON flashcards(mind_map_id);
CREATE INDEX idx_flashcard_progress_user_flashcard ON flashcard_progress(user_id, flashcard_id);
CREATE INDEX idx_flashcard_progress_next_review ON flashcard_progress(next_review_date);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
```

## 3. Estructura del Backend (FastAPI)

### Estructura de directorios:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Punto de entrada FastAPI
│   ├── config.py               # Configuración (variables de entorno)
│   ├── database.py             # Configuración SQLAlchemy asíncrona
│   ├── dependencies.py         # Dependencias comunes (get_db, get_current_user)
│   │
│   ├── models/                 # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── mind_map.py
│   │   ├── flashcard.py
│   │   └── game.py
│   │
│   ├── schemas/                # Esquemas Pydantic
│   │   ├── __init__.py
│   │   ├── user.py            # UserCreate, UserResponse, Token
│   │   ├── mind_map.py        # MindMapCreate, MindMapResponse, NodeSchema, EdgeSchema
│   │   ├── flashcard.py       # FlashcardResponse, FlashcardReview, SM2Update
│   │   └── game.py            # GameSessionCreate, GameSessionUpdate
│   │
│   ├── api/                    # Routers
│   │   ├── __init__.py
│   │   ├── auth.py            # POST /register, /login
│   │   ├── mind_maps.py       # POST /mind-maps (upload PDF), GET /mind-maps, GET /mind-maps/{id}
│   │   ├── flashcards.py      # GET /mind-maps/{id}/flashcards, POST /flashcards/{id}/review
│   │   └── game.py            # POST /game/sessions, PUT /game/sessions/{id}, GET /game/sessions/{id}
│   │
│   ├── services/               # Lógica de negocio
│   │   ├── __init__.py
│   │   ├── auth_service.py    # Hashing, verificación, JWT
│   │   ├── pdf_service.py     # Extracción de texto con PyMuPDF (en memoria)
│   │   ├── ai_service.py      # Llamadas asíncronas a Gemini 2.5 Flash
│   │   ├── mind_map_service.py # Generación de estructura del mapa mental
│   │   ├── flashcard_service.py # Generación de flashcards y algoritmo SM-2
│   │   └── game_service.py    # Lógica de validación del juego
│   │
│   └── utils/
│       ├── __init__.py
│       ├── security.py         # Funciones JWT, password hashing (bcrypt)
│       └── graph_validator.py  # Validación de estructura del grafo
│
├── alembic/                    # Migraciones de BD
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Dependencias principales (`requirements.txt`):

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.13.3
pydantic==2.10.0
pydantic-settings==2.6.0
python-multipart==0.0.12
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
PyMuPDF==1.24.13
google-genai==0.3.0  # SDK de Gemini
python-dotenv==1.0.1
```

### Configuración clave en `app/main.py`:

- CORS middleware para permitir peticiones desde el frontend
- Routers montados con prefijos: `/api/auth`, `/api/mind-maps`, `/api/flashcards`, `/api/game`
- Manejo global de excepciones

### Ejemplo de servicio AI (`app/services/ai_service.py`):

```python
from google import genai
from google.genai.types import GenerateContentConfig, HttpOptions

class AIService:
    def __init__(self):
        self.client = genai.Client(
            http_options=HttpOptions(api_version="v1")
        )
        self.model = "gemini-2.5-flash"
    
    async def generate_mind_map_structure(self, text: str) -> dict:
        """Genera estructura de mapa mental desde texto."""
        prompt = f"""Analiza el siguiente texto y genera un mapa mental en formato JSON.
        Estructura requerida:
        {{
          "nodes": [{{"id": "1", "label": "Concepto", "content": "Detalle", "level": 0}}],
          "edges": [{{"id": "e1", "source": "1", "target": "2"}}]
        }}
        
        Texto: {text}
        """
        
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config=GenerateContentConfig(response_modalities=["TEXT"])
        )
        # Parsear JSON de response.text
        return response.text
```

## 4. Adaptación del Frontend

### Nueva estructura de directorios:

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Layout.tsx
│   ├── mindmap/
│   │   ├── MindMapViewer.tsx     # Adaptación de App.tsx actual
│   │   ├── FloatingEdge.tsx      # Ya existe
│   │   ├── FloatingConnectionLine.tsx # Ya existe
│   │   └── MindMapNode.tsx       # Componente personalizado de nodo
│   ├── flashcards/
│   │   ├── FlashcardDeck.tsx
│   │   ├── FlashcardItem.tsx
│   │   └── FlashcardStats.tsx
│   ├── game/
│   │   ├── GameBoard.tsx         # Reutiliza MindMapViewer con lógica de juego
│   │   └── GameScore.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ... (otros componentes shadcn)
│
├── pages/
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   ├── MindMapDetail.tsx
│   ├── FlashcardsPage.tsx
│   ├── GamePage.tsx
│   ├── Login.tsx
│   └── Register.tsx
│
├── services/
│   ├── api.ts                    # Configuración de Axios
│   ├── authService.ts
│   ├── mindMapService.ts
│   ├── flashcardService.ts
│   └── gameService.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useMindMap.ts
│   └── useFlashcards.ts
│
├── types/
│   ├── mindmap.ts
│   ├── flashcard.ts
│   ├── game.ts
│   └── auth.ts
│
├── utils/
│   ├── sm2Algorithm.ts          # Implementación cliente del SM-2
│   ├── graphValidator.ts        # Validación de estructura del grafo
│   └── storage.ts               # LocalStorage para JWT
│
├── lib/
│   └── utils.ts                 # Utilidades de shadcn
│
├── App.tsx                       # Router principal
├── main.tsx
└── index.css
```

### Librerías adicionales a instalar:

```bash
npm install axios react-router-dom@6 zustand date-fns
npm install -D @types/node
npx shadcn@latest init  # Instalar shadcn/ui
npx shadcn@latest add button card input dialog toast label select
```

### Configuración de Axios (`services/api.ts`):

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Adaptación de React Flow para el juego:

- Reutilizar `MindMapViewer.tsx` con prop `isGameMode: boolean`
- En modo juego: nodos desordenados aleatoriamente, usuario los reorganiza
- Validación: comparar estructura de `edges` con el grafo original usando `utils/graphValidator.ts`

## 5. Docker y Docker Compose

### Estructura de archivos:

```
mapit/
├── docker-compose.yml
├── backend/
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

### `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: mapit_user
      POSTGRES_PASSWORD: mapit_password
      POSTGRES_DB: mapit_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mapit_user"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://mapit_user:mapit_password@db:5432/mapit_db
      SECRET_KEY: your-secret-key-change-in-production
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000/api

volumes:
  postgres_data:
```

### `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `frontend/Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
```

## 6. Flujo de Trabajo Principal

### 1. Usuario sube PDF:

1. Frontend: `<input type="file">` → FormData con PDF
2. Backend: `POST /api/mind-maps` recibe PDF
3. `pdf_service.py`: extrae texto con PyMuPDF (memoria)
4. `ai_service.py`: llama async a Gemini 2.5 Flash con prompt para generar estructura JSON
5. `mind_map_service.py`: procesa respuesta, calcula posiciones iniciales, guarda en BD
6. Respuesta: JSON con `{id, title, nodes[], edges[]}`
7. Frontend: renderiza con React Flow + d3-force

### 2. Generación de Flashcards:

1. Backend: usa el mismo texto del PDF
2. `ai_service.py`: prompt para generar Q&A pairs
3. Guarda en tabla `flashcards`
4. Frontend: muestra deck, usuario revisa
5. Según respuesta (fácil/medio/difícil), actualiza `flashcard_progress` con SM-2

### 3. Juego de Reordenamiento:

1. Frontend: carga mapa mental, desordena nodos aleatoriamente
2. Usuario arrastra y conecta nodos
3. Al finalizar: `POST /api/game/sessions` con estructura creada
4. Backend: `graph_validator.py` compara con estructura original
5. Respuesta: score (100% si exacto, parcial si similar)

## 7. Configuración para Despliegue en Render

### Variables de entorno necesarias:

- `DATABASE_URL`: PostgreSQL URL de Render
- `SECRET_KEY`: para JWT
- `GEMINI_API_KEY`: API key de Google Cloud
- `FRONTEND_URL`: URL del frontend para CORS

### Archivos adicionales:

- `backend/render.yaml`: configuración de servicios
- Build command backend: `pip install -r requirements.txt && alembic upgrade head`
- Start command backend: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Build command frontend: `npm install && npm run build`
- Start command frontend: servir `dist/` con servidor estático

## 8. Actualización de .gitignore

Añadir:

```
# Backend
backend/__pycache__/
backend/.env
backend/*.db
backend/venv/

# Docker
postgres_data/

# Environments
.env
.env.local
```

### To-dos

- [ ] Crear estructura de directorios del backend y archivos base (main.py, config.py, database.py, dependencies.py)
- [ ] Implementar modelos SQLAlchemy para users, mind_maps, nodes, edges, flashcards, progress, game_sessions
- [ ] Crear esquemas Pydantic para validación de datos en auth, mind_maps, flashcards, game
- [ ] Implementar sistema de autenticación JWT con registro, login y middleware de autorización
- [ ] Crear servicio de procesamiento de PDF en memoria con PyMuPDF
- [ ] Integrar Gemini 2.5 Flash con llamadas asíncronas para generación de mapas mentales y flashcards
- [ ] Crear endpoints de mapas mentales (upload PDF, listar, obtener detalle) y servicio de generación
- [ ] Crear endpoints de flashcards y servicio con algoritmo SM-2
- [ ] Crear endpoints del juego y servicio de validación de estructura del grafo
- [ ] Instalar dependencias (axios, react-router-dom, zustand, shadcn/ui) y crear estructura de carpetas
- [ ] Crear páginas de login/registro, servicio de autenticación y hook useAuth
- [ ] Adaptar App.tsx actual a componente MindMapViewer reutilizable con integración a API
- [ ] Crear componentes de flashcards con interfaz de revisión y sistema SM-2
- [ ] Crear interfaz del juego reutilizando MindMapViewer con lógica de validación
- [ ] Crear Dockerfiles y docker-compose.yml para backend, frontend y PostgreSQL
- [ ] Configurar Alembic y crear migración inicial con el esquema completo de BD
- [ ] Actualizar .gitignore con exclusiones de backend, Docker y variables de entorno