# 📐 Arquitectura de MapIT

## 🎯 ¿Qué es MapIT?

MapIT es una aplicación web educativa que convierte documentos PDF en herramientas interactivas de aprendizaje. Imagina que tienes un documento de estudio denso y complejo: MapIT lo transforma automáticamente en:

- Un **mapa mental visual** con conceptos organizados
- **Tarjetas de estudio** (flashcards) con preguntas y respuestas
- Un **juego educativo** donde puedes poner a prueba tu conocimiento

Todo esto sucede de manera automática gracias a la Inteligencia Artificial.

---

## 🏗️ Visión General de la Arquitectura

MapIT está construido siguiendo una arquitectura moderna de **tres capas** que se comunican entre sí:

```
┌─────────────────────────────────────────────────┐
│           NAVEGADOR WEB (Usuario)               │
│              Frontend (React)                   │
└────────────────┬────────────────────────────────┘
                 │ Peticiones HTTP
                 ↓
┌─────────────────────────────────────────────────┐
│          SERVIDOR DE APLICACIÓN                 │
│            Backend (FastAPI)                    │
│  - Procesa PDFs                                 │
│  - Se comunica con la IA                        │
│  - Gestiona la lógica de negocio                │
└────────────────┬────────────────────────────────┘
                 │ Consultas SQL
                 ↓
┌─────────────────────────────────────────────────┐
│          BASE DE DATOS (PostgreSQL)             │
│  - Almacena usuarios                            │
│  - Guarda mapas mentales                        │
│  - Registra progreso de aprendizaje             │
└─────────────────────────────────────────────────┘
```

Esta separación permite que cada componente se especialice en su función y puedan actualizarse de manera independiente.

---

## 🎨 Frontend: La Interfaz de Usuario

### ¿Qué es?

El frontend es lo que ves y con lo que interactúas en tu navegador. Es la "cara visible" de la aplicación.

### Tecnologías Utilizadas

#### **React 19** - El Marco Principal

- **¿Qué es?** Una biblioteca de JavaScript para construir interfaces de usuario
- **¿Para qué sirve?** Permite crear componentes reutilizables (como botones, formularios, tarjetas) que se actualizan automáticamente cuando cambian los datos
- **Ventaja:** Hace que la aplicación sea rápida y reactiva, sin necesidad de recargar la página

#### **TypeScript** - Seguridad en el Código

- **¿Qué es?** JavaScript con tipos de datos definidos
- **¿Para qué sirve?** Previene errores al escribir código, como intentar sumar un número con un texto
- **Ventaja:** Detecta problemas antes de que la aplicación se ejecute

#### **Vite + SWC** - Herramientas de Desarrollo Rápido

- **¿Qué son?** Herramientas que preparan y optimizan el código para el navegador
- **¿Para qué sirven?** Vite proporciona un entorno de desarrollo ultrarrápido; SWC compila el código TypeScript a JavaScript velozmente
- **Ventaja:** Los cambios que haces al código se reflejan instantáneamente en el navegador

#### **Tailwind CSS + shadcn/ui** - Diseño Visual

- **¿Qué son?** Herramientas para dar estilo a la aplicación
- **¿Para qué sirven?** Tailwind permite crear diseños personalizados con clases CSS predefinidas; shadcn/ui proporciona componentes visuales hermosos y accesibles
- **Ventaja:** La aplicación se ve profesional y moderna sin tener que diseñar desde cero

#### **React Router** - Navegación entre Páginas

- **¿Qué es?** Sistema de rutas para aplicaciones React
- **¿Para qué sirve?** Permite navegar entre diferentes páginas (inicio, login, dashboard, mapas mentales) sin recargar completamente la aplicación
- **Ventaja:** Navegación fluida y rápida, como en una app móvil

#### **Zustand** - Gestión de Estado

- **¿Qué es?** Una biblioteca para manejar el estado global de la aplicación
- **¿Para qué sirve?** Guarda información que necesita estar disponible en toda la app (como datos del usuario logueado)
- **Ventaja:** Simple y eficiente, evita pasar datos manualmente entre componentes

#### **Axios** - Comunicación con el Backend

- **¿Qué es?** Una herramienta para hacer peticiones HTTP
- **¿Para qué sirve?** Permite que el frontend se comunique con el backend para enviar y recibir datos
- **Ventaja:** Manejo automático de errores y configuración simplificada

#### **React Flow** - Visualización de Mapas Mentales

- **¿Qué es?** Una biblioteca especializada en diagramas interactivos
- **¿Para qué sirve?** Renderiza los mapas mentales con nodos (conceptos) y conexiones, permitiendo zoom, arrastre y reorganización
- **Ventaja:** Experiencia visual e interactiva para explorar el conocimiento

#### **d3-hierarchy** - Organización Jerárquica

- **¿Qué es?** Una herramienta de visualización de datos
- **¿Para qué sirve?** Organiza automáticamente los nodos del mapa mental en una estructura jerárquica visual
- **Ventaja:** Los conceptos principales están arriba y los detalles abajo, facilitando la comprensión

---

## ⚙️ Backend: El Cerebro de la Aplicación

### ¿Qué es?

El backend es el servidor que procesa toda la lógica de negocio. Es como el "motor" que hace que todo funcione detrás de escena.

### Tecnologías Utilizadas

#### **FastAPI** - Framework Web Moderno

- **¿Qué es?** Un framework para construir APIs (interfaces de programación) en Python
- **¿Para qué sirve?** Recibe peticiones del frontend, las procesa y devuelve respuestas
- **Ventaja:** Extremadamente rápido, fácil de usar y con documentación automática

#### **Python 3.12+** - Lenguaje de Programación

- **¿Qué es?** El lenguaje en el que está escrito el backend
- **¿Para qué sirve?** Permite escribir lógica compleja de manera clara y legible
- **Ventaja:** Excelente para procesamiento de texto, IA y análisis de datos

#### **SQLAlchemy 2.0** - Comunicación con la Base de Datos

- **¿Qué es?** Una herramienta ORM (Object-Relational Mapping)
- **¿Para qué sirve?** Permite trabajar con la base de datos usando código Python en lugar de escribir SQL directamente
- **Ventaja:** Código más seguro, menos errores y compatible con diferentes bases de datos

#### **PostgreSQL** - Base de Datos Relacional

- **¿Qué es?** Un sistema de base de datos robusto y confiable
- **¿Para qué sirve?** Almacena toda la información: usuarios, mapas mentales, flashcards, progreso de aprendizaje
- **Ventaja:** Rápida, segura y capaz de manejar grandes volúmenes de datos

#### **Google Gemini 2.5 Flash** - Inteligencia Artificial

- **¿Qué es?** Un modelo de IA de última generación de Google
- **¿Para qué sirve?** Analiza el contenido del PDF y genera:
  - Estructura del mapa mental con conceptos principales y secundarios
  - Preguntas y respuestas para las flashcards
  - Evaluación inteligente de respuestas del usuario
- **Ventaja:** Comprensión profunda del texto y generación de contenido educativo relevante

#### **PyMuPDF** - Procesador de PDFs

- **¿Qué es?** Una biblioteca para trabajar con archivos PDF
- **¿Para qué sirve?** Extrae todo el texto del documento PDF de manera eficiente
- **Ventaja:** Rápido y procesa el PDF directamente en memoria (sin guardar archivos temporales)

#### **JWT (JSON Web Tokens)** - Autenticación y Seguridad

- **¿Qué es?** Un estándar para autenticación segura
- **¿Para qué sirve?** Verifica que los usuarios sean quienes dicen ser y protege sus datos
- **Ventaja:** Seguro, sin necesidad de mantener sesiones en el servidor

#### **Bcrypt** - Encriptación de Contraseñas

- **¿Qué es?** Un algoritmo de cifrado para contraseñas
- **¿Para qué sirve?** Protege las contraseñas de los usuarios para que nadie (ni siquiera los administradores) pueda verlas
- **Ventaja:** Incluso si la base de datos es comprometida, las contraseñas están seguras

#### **Alembic** - Migraciones de Base de Datos

- **¿Qué es?** Una herramienta para versionar cambios en la base de datos
- **¿Para qué sirve?** Permite actualizar la estructura de la base de datos sin perder información
- **Ventaja:** Control total sobre la evolución de la base de datos

---

## 🐳 DevOps: Despliegue y Contenedores

### **Docker + Docker Compose** - Contenedores

- **¿Qué son?** Herramientas para empaquetar aplicaciones con todo lo que necesitan
- **¿Para qué sirven?** Garantizan que la aplicación funcione igual en cualquier computadora
- **Ventaja:** "Funciona en mi máquina" se convierte en "funciona en todas las máquinas"

### **Nginx** - Servidor Web

- **¿Qué es?** Un servidor web de alto rendimiento
- **¿Para qué sirve?** En producción, sirve los archivos del frontend y gestiona las conexiones
- **Ventaja:** Muy rápido, eficiente y optimizado para tráfico web

---

## 🔄 Flujos de Datos en la Aplicación

### 1. **Flujo de Registro e Inicio de Sesión**

```
Usuario → Formulario de Registro
    ↓
Frontend envía (email, password, nombre)
    ↓
Backend recibe los datos
    ↓
Backend cifra la contraseña con Bcrypt
    ↓
Backend guarda el usuario en PostgreSQL
    ↓
Backend genera un Token JWT
    ↓
Frontend recibe y guarda el token
    ↓
Usuario está autenticado ✓
```

**¿Qué pasa detrás de escena?**

- Tu contraseña nunca se guarda en texto plano
- El token JWT es como una "llave digital" que usas en cada petición
- El frontend guarda el token en el almacenamiento local del navegador

---

### 2. **Flujo de Creación de Mapa Mental desde PDF**

```
Usuario selecciona un archivo PDF
    ↓
Frontend envía el archivo al backend
    ↓
Backend recibe el PDF (bytes en memoria)
    ↓
PyMuPDF extrae todo el texto del PDF
    ↓
Backend calcula un "hash" del contenido
    │ (huella digital única del documento)
    ↓
Backend envía el texto a Google Gemini IA
    ↓
Gemini analiza el contenido y genera:
    - Título del mapa
    - Nodos (conceptos) con niveles jerárquicos
    - Conexiones entre conceptos
    ↓
Backend valida la estructura generada
    ↓
Backend guarda en PostgreSQL:
    - MindMap (registro principal)
    - MindMapNodes (cada concepto)
    - MindMapEdges (conexiones)
    ↓
Backend devuelve el mapa mental completo
    ↓
Frontend renderiza el mapa con React Flow
    ↓
Usuario ve su mapa mental interactivo ✓
```

**¿Qué tecnologías participan?**

- **PyMuPDF:** Lee el PDF
- **Google Gemini:** Entiende el contenido y crea la estructura
- **PostgreSQL:** Almacena todo para futuras consultas
- **React Flow:** Muestra el mapa de forma visual e interactiva

---

### 3. **Flujo de Generación de Flashcards**

```
Usuario solicita flashcards para un mapa mental
    ↓
Frontend envía: ID del mapa + archivo PDF original
    ↓
Backend verifica si ya existen flashcards
    │
    ├── Si existen → devuelve las existentes
    │
    └── Si no existen:
        ↓
        PyMuPDF extrae texto del PDF
        ↓
        Backend envía texto a Gemini IA
        ↓
        Gemini genera N flashcards con:
            - Pregunta relevante
            - Respuesta correcta
        ↓
        Backend guarda flashcards en PostgreSQL
        ↓
        Backend devuelve las flashcards
        ↓
        Frontend muestra las tarjetas
        ↓
        Usuario puede estudiar ✓
```

**Detalle importante:**
Las flashcards se generan una sola vez por mapa mental y se reutilizan, ahorrando tiempo y llamadas a la IA.

---

### 4. **Flujo de Estudio con Repetición Espaciada (Algoritmo SM-2)**

```
Usuario responde a una flashcard
    ↓
Frontend evalúa la calidad de la respuesta
    │ (Fácil, Normal, Difícil, Otra vez)
    ↓
Frontend envía: flashcard_id + quality_rating
    ↓
Backend recupera el progreso previo del usuario
    ↓
Backend aplica el Algoritmo SM-2:
    - Calcula nuevo intervalo de revisión
    - Ajusta el factor de facilidad
    - Incrementa el número de repeticiones
    - Determina la próxima fecha de revisión
    ↓
Backend actualiza FlashcardProgress en PostgreSQL
    ↓
Backend devuelve nueva información de progreso
    ↓
Frontend actualiza la interfaz
    ↓
Usuario ve cuándo debe revisar esta carta ✓
```

**¿Qué es el Algoritmo SM-2?**
Es un método científico de aprendizaje que calcula cuándo debes repasar cada tarjeta basándose en qué tan bien la recordaste. Si fue fácil, la verás en más tiempo; si fue difícil, la verás pronto. Esto optimiza tu memoria a largo plazo.

---

### 5. **Flujo del Juego de Reordenamiento**

```
Usuario inicia el juego desde un mapa mental
    ↓
Frontend solicita sesión de juego
    ↓
Backend crea un registro GameSession vacío
    ↓
Backend guarda GameSession en PostgreSQL
    ↓
Backend devuelve ID de la sesión
    ↓
Frontend recibe el mapa mental original
    ↓
Frontend desorganiza los nodos
    ↓
Frontend inicia con CERO conexiones
    ↓
Usuario ve nodos dispersos sin conectar
    ↓
Usuario crea conexiones arrastrando entre nodos
    ↓
Usuario envía su solución al completar
    ↓
Backend recibe las conexiones creadas
    ↓
Backend compara con el mapa mental original
    ↓
Backend calcula puntuación:
    - % de conexiones correctas
    - Conexiones que coinciden exactamente
    ↓
Backend actualiza GameSession:
    - Marca como completada
    - Guarda puntuación
    - Registra tiempo empleado
    ↓
Backend devuelve resultados
    ↓
Frontend muestra puntuación y feedback
    ↓
Si es récord personal, se actualiza ✓
```

**¿Cómo funciona exactamente?**

- Los nodos se distribuyen aleatoriamente usando un algoritmo de posicionamiento circular
- El usuario comienza con un lienzo vacío (sin conexiones)
- Debe recrear las relaciones entre conceptos desde cero
- La puntuación se basa únicamente en cuántas conexiones coinciden con el original

**¿Por qué es educativo?**
El juego te obliga a recordar cómo se relacionan los conceptos, reforzando tu comprensión de la materia de forma activa y divertida. No se trata de reorganizar conexiones existentes, sino de recrearlas completamente desde tu memoria.

---

### 6. **Flujo de Evaluación de Respuestas con IA**

```
Usuario escribe una respuesta a una flashcard
    ↓
Frontend envía:
    - Pregunta de la flashcard
    - Respuesta esperada
    - Respuesta del usuario
    ↓
Backend construye prompt para Gemini:
    "Evalúa si esta respuesta es correcta..."
    ↓
Gemini analiza semánticamente:
    - ¿Captura la idea principal?
    - ¿Es factualmente correcta?
    - ¿Es lo suficientemente completa?
    ↓
Gemini devuelve:
    - is_correct: true/false
    - feedback: explicación
    ↓
Backend envía resultado al frontend
    ↓
Frontend muestra:
    - ✓ Correcto o ✗ Incorrecto
    - Retroalimentación explicativa
    ↓
Usuario aprende de sus errores ✓
```

**Ventaja de usar IA:**
No necesitas responder exactamente igual que la respuesta esperada. Gemini entiende sinónimos, paráfrasis y diferentes formas de expresar la misma idea.

---

## 🔒 Seguridad en MapIT

### **Autenticación con JWT**

- Cada usuario recibe un token único al iniciar sesión
- El token tiene fecha de expiración (30 minutos por defecto)
- Todas las peticiones protegidas verifican este token

### **Encriptación de Contraseñas**

- Las contraseñas se cifran con Bcrypt antes de guardarse
- Incluso con acceso a la base de datos, las contraseñas son ilegibles

### **Validación de Permisos**

- Cada usuario solo puede ver y modificar sus propios mapas mentales
- El backend verifica la propiedad de los recursos en cada petición

### **CORS (Cross-Origin Resource Sharing)**

- Solo permite peticiones desde orígenes autorizados
- Previene ataques de sitios maliciosos

### **Hashing de Contenido PDF**

- Evita procesar el mismo PDF múltiples veces
- Detecta si el usuario ya subió ese documento anteriormente

---

## 📊 Estructura de la Base de Datos

### **Tablas Principales**

#### **users** - Usuarios del Sistema

- `id`: Identificador único
- `email`: Correo electrónico (único)
- `full_name`: Nombre completo
- `hashed_password`: Contraseña cifrada

#### **mind_maps** - Mapas Mentales

- `id`: Identificador único
- `user_id`: Dueño del mapa
- `title`: Título del mapa
- `pdf_filename`: Nombre del archivo original
- `pdf_content_hash`: Huella digital del PDF
- `created_at`: Fecha de creación

#### **mind_map_nodes** - Nodos (Conceptos)

- `id`: Identificador único
- `mind_map_id`: Mapa al que pertenece
- `node_id`: ID del nodo en el grafo
- `label`: Título del concepto
- `content`: Descripción detallada
- `level`: Nivel jerárquico (0 = raíz, 1 = hijo, etc.)
- `position_x`, `position_y`: Coordenadas visuales

#### **mind_map_edges** - Conexiones

- `id`: Identificador único
- `mind_map_id`: Mapa al que pertenece
- `edge_id`: ID de la conexión
- `source_node_id`: Nodo origen
- `target_node_id`: Nodo destino

#### **flashcards** - Tarjetas de Estudio

- `id`: Identificador único
- `mind_map_id`: Mapa del que se generaron
- `question`: Pregunta
- `answer`: Respuesta correcta

#### **flashcard_progress** - Progreso del Usuario

- `id`: Identificador único
- `flashcard_id`: Tarjeta asociada
- `user_id`: Usuario estudiante
- `repetitions`: Número de veces estudiada
- `easiness_factor`: Factor de facilidad (SM-2)
- `interval`: Días hasta próxima revisión
- `next_review_date`: Cuándo debe revisarse

#### **game_sessions** - Sesiones de Juego

- `id`: Identificador único
- `mind_map_id`: Mapa usado para el juego
- `user_id`: Jugador
- `score`: Puntuación obtenida
- `completed`: Si terminó el juego
- `started_at`, `completed_at`: Tiempos

---

## 🌐 Comunicación Frontend ↔ Backend

### **API RESTful**

MapIT usa una API REST, que es como un "menú de opciones" que el frontend puede pedir al backend:

#### **Rutas de Autenticación**

- `POST /api/register` → Crear cuenta
- `POST /api/login` → Iniciar sesión
- `GET /api/users/me` → Obtener datos del usuario actual

#### **Rutas de Mapas Mentales**

- `POST /api/mind-maps` → Subir PDF y crear mapa
- `GET /api/mind-maps` → Listar todos los mapas del usuario
- `GET /api/mind-maps/{id}` → Obtener un mapa específico

#### **Rutas de Flashcards**

- `POST /api/flashcards/generate` → Generar flashcards
- `GET /api/flashcards/mind-map/{id}` → Obtener flashcards de un mapa
- `GET /api/flashcards/{id}/due` → Ver tarjetas pendientes
- `POST /api/flashcards/{id}/review` → Registrar revisión
- `POST /api/flashcards/evaluate` → Evaluar respuesta con IA

#### **Rutas de Juego**

- `POST /api/game/start/{mind_map_id}` → Iniciar juego
- `POST /api/game/{session_id}/submit` → Enviar solución
- `GET /api/game/{session_id}` → Ver estado del juego

### **Formato de Datos: JSON**

Todos los datos se intercambian en formato JSON, que es fácil de leer tanto para humanos como para máquinas:

```json
{
  "id": "123-456-789",
  "title": "Fotosíntesis",
  "nodes": [
    {
      "id": "1",
      "label": "Proceso de Fotosíntesis",
      "level": 0
    }
  ]
}
```

---

## 🚀 Despliegue y Entornos

### **Modo Desarrollo**

Activado con: `docker-compose -f docker-compose.dev.yml up`

**Características:**

- ⚡ **Hot-reload:** Los cambios en el código se reflejan inmediatamente
- 📝 **Logging detallado:** Mensajes de depuración completos
- 🔍 **Adminer:** Interfaz web para explorar la base de datos
- **Puertos:**
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:8000`
  - Base de datos: `localhost:5432`
  - Adminer: `http://localhost:8080`

**¿Para quién?** Desarrolladores trabajando en el proyecto.

---

### **Modo Producción**

Activado con: `docker-compose -f docker-compose.prod.yml up`

**Características:**

- ✅ **Frontend compilado:** Archivos optimizados y minificados
- ✅ **Nginx:** Sirve archivos estáticos con alta eficiencia
- ✅ **Sin hot-reload:** Menor consumo de recursos
- ✅ **Compresión gzip:** Transferencias más rápidas
- ✅ **Cache de assets:** Imágenes y CSS se cachean en el navegador
- **Puertos:**
  - Aplicación completa: `http://localhost:8080`
  - Backend API: `http://localhost:8000`

**¿Para quién?** Usuarios finales o pruebas en entornos similares a producción.

---

## 🧩 Componentes Principales del Frontend

### **Páginas (Pages)**

- `Home.tsx` → Página de bienvenida
- `Login.tsx` / `Register.tsx` → Autenticación
- `Dashboard.tsx` → Panel principal con lista de mapas
- `MindMapDetail.tsx` → Vista detallada del mapa mental
- `FlashcardsPage.tsx` → Interfaz de estudio con flashcards
- `GamePage.tsx` → Juego de reordenamiento

### **Componentes Reutilizables**

- `Navbar.tsx` → Barra de navegación superior
- `LoginForm.tsx` / `RegisterForm.tsx` → Formularios de autenticación
- `FlashcardDeck.tsx` → Mazo de tarjetas
- `FlashcardItem.tsx` → Tarjeta individual con efecto de volteo
- `GameBoard.tsx` → Tablero del juego interactivo
- `MindMapReadViewer.tsx` → Visualizador de solo lectura
- `MindMapGameViewer.tsx` → Visualizador editable para el juego

### **Hooks Personalizados**

- `useAuth.ts` → Gestión de autenticación y estado del usuario
- `useMindMap.ts` → Operaciones con mapas mentales
- `useFlashcards.ts` → Lógica de flashcards y repetición espaciada

### **Servicios**

- `authService.ts` → Llamadas a la API de autenticación
- `mindMapService.ts` → Operaciones CRUD de mapas
- `flashcardService.ts` → Gestión de flashcards
- `gameService.ts` → Interacciones del juego

---

## 📝 Resumen de Flujo Completo

1. **Usuario se registra/inicia sesión** → Backend valida y emite token JWT
2. **Usuario sube un PDF** → Backend extrae texto con PyMuPDF
3. **IA procesa el texto** → Gemini genera estructura del mapa mental
4. **Backend guarda todo** → PostgreSQL almacena mapa, nodos y conexiones
5. **Frontend visualiza** → React Flow renderiza el mapa interactivo
6. **Usuario solicita flashcards** → IA genera preguntas y respuestas
7. **Usuario estudia** → Algoritmo SM-2 optimiza el calendario de revisión
8. **Usuario juega** → Reconecta nodos y recibe puntuación
9. **Aprendizaje completo** → El usuario ha interactuado con el contenido de 3 formas diferentes

---

## 🎯 Ventajas de Esta Arquitectura

### **Separación de Responsabilidades**

Cada capa tiene una función clara, lo que facilita el mantenimiento y las mejoras.

### **Escalabilidad**

- Frontend y backend pueden desplegarse en servidores separados
- Pueden agregarse más instancias del backend para manejar más usuarios
- La base de datos puede crecer sin afectar el código

### **Seguridad por Capas**

- Autenticación en el backend
- Validación de datos en ambos lados
- Encriptación de información sensible

### **Experiencia de Usuario Fluida**

- React hace que la interfaz responda instantáneamente
- Las peticiones asíncronas permiten trabajar mientras se cargan datos
- React Flow proporciona una experiencia visual de alta calidad

### **Inteligencia Artificial Integrada**

- Gemini automatiza tareas que serían imposibles manualmente
- Mejora continua: el modelo de IA se actualiza sin cambiar el código

### **Desarrollo Eficiente**

- Hot-reload acelera el ciclo de desarrollo
- Docker garantiza consistencia entre entornos
- TypeScript previene errores antes de la ejecución

---

## 🔮 Posibles Extensiones Futuras

Gracias a la arquitectura modular, MapIT puede crecer fácilmente:

- **Colaboración en tiempo real:** Múltiples usuarios editando el mismo mapa
- **Exportación a diferentes formatos:** PDF, imagen, Markdown
- **Más juegos educativos:** Cuestionarios, emparejamientos, crucigramas
- **Estadísticas de aprendizaje:** Gráficos de progreso, heatmaps de conocimiento
- **Soporte para más formatos:** Word, PowerPoint, imágenes con OCR
- **Modo offline:** Estudiar sin conexión a internet
- **Aplicación móvil:** Versión nativa para iOS y Android
- **Integración con LMS:** Conectar con plataformas como Moodle o Canvas

---

## 📚 Glosario de Términos

- **API:** Interfaz que permite que dos aplicaciones se comuniquen
- **Async/Await:** Forma moderna de manejar operaciones que toman tiempo (como consultas a la base de datos)
- **ORM:** Herramienta que permite trabajar con bases de datos usando objetos en lugar de SQL
- **Hash:** Huella digital única de un archivo o texto
- **JWT:** Token de seguridad que verifica identidad sin guardar sesiones
- **REST:** Estilo de arquitectura para APIs web
- **Docker:** Tecnología para empaquetar aplicaciones en contenedores
- **Hot-reload:** Actualización automática del código sin reiniciar la aplicación
- **Componente:** Pieza reutilizable de interfaz de usuario
- **Hook:** Función especial de React que agrega capacidades a los componentes
- **Middleware:** Software que intercepta peticiones para agregar funcionalidad (como logging)

---

**MapIT** combina tecnologías modernas de desarrollo web con inteligencia artificial para crear una experiencia de aprendizaje única, eficiente y agradable. Su arquitectura bien organizada permite que la aplicación sea mantenible, escalable y fácil de extender con nuevas funcionalidades.
