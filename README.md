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
- Evaluacion de respuestas con IA

### 3. 🎮 Juego de Conexión de Conceptos

- Modo de juego interactivo
- Conecta nodos dispersos recreando el mapa mental desde cero
- Sistema de puntuación basado en precisión
- Rastrea tu mejor puntuación y tiempo

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
- **UI:** shadcn/ui + Tailwind CSS + Lucide Icons
- **Routing:** React Router DOM 7
- **State:** Zustand
- **HTTP:** Axios
- **Visualización:** React Flow (@xyflow/react) + d3-hierarchy

### DevOps

- **Contenedores:** Docker + Docker Compose
- **Servidor Web (Producción):** Nginx
- **Migraciones DB:** Alembic

## Inicio Rápido

### Prerequisitos

- Docker y Docker Compose instalados
- API Key de Google Gemini ([obtener aquí](https://aistudio.google.com/app/apikey))

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

**⚠️ Importante:** En el primer inicio, mientras los servicios están corriendo, ejecuta las migraciones de base de datos en otra terminal:

```bash
docker-compose -f docker-compose.dev.yml exec backend alembic upgrade head
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

**⚠️ Importante:** En el primer inicio, mientras los servicios están corriendo, ejecuta las migraciones de base de datos en otra terminal:

```bash
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
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

La API completa está documentada en **Swagger UI**: http://localhost:8000/docs (modo desarrollo)

### Autenticación

- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión (OAuth2)
- `GET /api/users/me` - Obtener usuario actual

### Mapas Mentales

- `POST /api/mind-maps` - Subir PDF y crear mapa mental
- `GET /api/mind-maps` - Listar mapas del usuario
- `GET /api/mind-maps/{id}` - Obtener mapa específico con nodos y conexiones

### Flashcards

- `POST /api/flashcards/generate` - Generar flashcards desde PDF
- `GET /api/flashcards/mind-map/{id}` - Obtener flashcards de un mapa
- `GET /api/flashcards/{id}` - Obtener flashcard específica
- `GET /api/flashcards/{id}/due` - Flashcards pendientes de revisión
- `POST /api/flashcards/{id}/review` - Registrar revisión (SM-2)
- `POST /api/flashcards/evaluate` - Evaluar respuesta con IA

### Juego

- `POST /api/game/sessions` - Crear nueva sesión de juego
- `PUT /api/game/sessions/{id}` - Completar sesión y enviar solución
- `GET /api/game/sessions/{id}` - Obtener detalles de sesión
- `GET /api/game/sessions` - Listar sesiones del usuario

## Características Técnicas Destacadas

### Inteligencia Artificial

- **Google Gemini 2.5 Flash** para análisis semántico de PDFs
- Generación automática de estructura de mapas mentales jerárquicos
- Creación inteligente de preguntas y respuestas para flashcards
- Evaluación semántica de respuestas del usuario (acepta sinónimos y paráfrasis)

### Aprendizaje Optimizado

- **Algoritmo SM-2** para repetición espaciada científicamente probada
- Cálculo dinámico de intervalos de revisión basado en desempeño
- Factor de facilidad adaptativo por tarjeta
- Sistema de próxima revisión automático

### Seguridad

- Contraseñas cifradas con **Bcrypt**
- Autenticación con **JWT** (JSON Web Tokens)
- Validación de permisos por usuario
- Protección CORS configurada
- Hashing de contenido PDF para evitar duplicados

### Rendimiento

- Procesamiento de PDF en memoria (sin archivos temporales)
- Async/Await en todo el backend para operaciones no bloqueantes
- SQLAlchemy async con PostgreSQL para consultas eficientes
- Frontend compilado y optimizado con Vite + SWC
- Compresión gzip y cache de assets en producción

## Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
