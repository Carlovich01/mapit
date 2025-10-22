# Personalización de Colores - MapIT

## Resumen de Cambios

Se ha personalizado toda la interfaz del sistema con la nueva paleta de colores proporcionada, manteniendo intactos los colores de los nodos jerárquicos y los indicadores de flashcards vencidas.

## Paleta de Colores Aplicada

### Colores Principales
- **#2563eb** - Azul primario (botones, enlaces, elementos interactivos)
- **#3b82f6** - Azul secundario claro (hover states, acentos)
- **#111827** - Gris oscuro (fondos en modo oscuro)
- **#f3f4f6** - Gris claro (fondos en modo claro)
- **#21589b** - Azul medio oscuro (elementos secundarios en dark mode)
- **#194584** - Azul más oscuro (cards en dark mode)
- **#1c4da3** - Azul medio (hover de edges, detalles)

## Archivos Modificados

### 1. Variables CSS Principales (`frontend/src/index.css`)
- Actualizadas todas las variables CSS personalizadas para modo claro y oscuro
- Colores de fondo, texto, bordes, y componentes ahora usan la nueva paleta
- Los edges seleccionados y en hover ahora usan los colores de marca

### 2. Tema ReactFlow (`frontend/src/xy-theme.css`)
- Fondo del canvas: `#f3f4f6` (claro) y `#111827` (oscuro)
- Colores de selección, hover y focus actualizados a la paleta azul
- Handles y bordes ahora usan `#2563eb`
- Variables de tema personalizadas actualizadas

### 3. Configuración Tailwind (`frontend/tailwind.config.js`)
- Agregados colores personalizados adicionales:
  - `brand-blue`: #2563eb
  - `brand-blue-light`: #3b82f6
  - `brand-dark`: #111827
  - `brand-light`: #f3f4f6
  - `brand-blue-darker`: #21589b
  - `brand-blue-darkest`: #194584
  - `brand-blue-medium`: #1c4da3

### 4. Componentes de Flashcards
- **FlashcardsPage.tsx**: 
  - Eliminada la card separada de contador de flashcards pendientes
  - La información ahora está integrada en cada card de pregunta
  - Agregado botón "Volver al Dashboard" cuando no hay flashcards pendientes
- **FlashcardItem.tsx**: 
  - Header rediseñado con degradado azul (from-primary to-#3b82f6)
  - Ícono de libro en círculo semitransparente
  - Título muestra directamente "X flashcard(s) pendiente(s)" en blanco (tamaño 2xl)
  - Card de respuesta: Fondo `#f3f4f6` (claro) y `#194584` (oscuro) con borde azul primario
  - Título "Respuesta:": Color azul primario
  - El botón "Bien" usa `bg-brand-blue`
- **FlashcardDeck.tsx**: Pasa información de progreso (currentIndex y totalCards) a FlashcardItem
- ✅ **MANTENIDOS**: Colores verde (#10b981) y rojo (#ef4444) para indicadores de estado

### 5. Componentes de Conexión
- **FloatingConnectionLine.tsx** (ambos): Líneas de conexión ahora usan `#2563eb` en lugar de `#222`

### 6. Utilidades de Logging (`frontend/src/utils/logger.ts`)
- Color info actualizado a `#2563eb`
- Color de request actualizado a `#1c4da3`

## Colores Preservados (Sin Cambios)

### Nodos Jerárquicos (`frontend/src/utils/nodeStyles.ts`)
Los colores de los nodos del mapa mental se mantienen intactos para diferenciar niveles:
- Nivel 0: Púrpura (#8B5CF6)
- Nivel 1: Azul (#3B82F6)
- Nivel 2: Verde (#10B981)
- Nivel 3: Ámbar (#F59E0B)
- Nivel 4: Rojo (#EF4444)
- Nivel 5: Rosa (#EC4899)
- Nivel 6: Teal (#14B8A6)
- Nivel 7: Naranja (#F97316)

### Indicadores de Estado de Flashcards
- ✅ Verde (`text-green-600`): Flashcards al día
- 🔴 Rojo (`bg-red-500`, `text-red-600`): Flashcards vencidas
- Estos se mantienen para claridad visual del sistema de repetición espaciada

### Colores de Calidad de Flashcards
- Perfecto: Verde (#10b981)
- Mal: Rojo (#ef4444)
- Correcto: Amarillo (#f59e0b)
- Difícil: Naranja (#ea580c)
- No recuerdo: Gris (#6b7280)

## Resultado

La interfaz ahora tiene una apariencia coherente y profesional con la paleta de azules especificada, mientras mantiene los elementos visuales importantes para la usabilidad del sistema (jerarquía de nodos y estado de flashcards).

## Actualización: Navbar y Headers Blancos

**Cambio adicional aplicado:** Todos los navbar y headers ahora tienen fondo blanco (`bg-white`) para una mejor claridad visual:
- Navbar principal
- Header de Flashcards
- Header de Juego
- Header de Mapa Mental (sticky)
- Barra de controles del GameBoard

## Actualización: Navbar Simplificado

**Cambio adicional aplicado:** El Navbar ahora solo muestra elementos cuando el usuario está autenticado:
- **Cuando NO autenticado**: Solo logo y texto "MapIT" (sin botones)
- **Cuando autenticado**: 
  - Ícono de usuario con color azul primario
  - Nombre del usuario
  - Botón "Salir" con color azul primario

**En la página Home:**
- **Botón "Iniciar Sesión"**: Fondo blanco con hover a gris suave
- **Botón "Registrarse"**: Usa color azul primario

## Actualización: Botones del Dashboard Unificados

**Cambio adicional aplicado:** Todos los botones de las cards en el Dashboard ahora usan `variant="default"`:
- **Botón "Ver Mapa"**: Usa `bg-primary` (color definido en variables CSS)
- **Botón "Flashcards"**: Usa `bg-primary` (sin cambiar según estado de flashcards)
- **Botón "Jugar"**: Usa `bg-primary`
- Todos los botones usan las variables del tema para mantener consistencia y facilitar el mantenimiento

## Cómo Probar los Cambios

1. Ejecuta el frontend con `npm run dev`
2. Verifica los colores en:
   - ✅ **Navbar y headers blancos** - Nueva actualización
   - Botones principales
   - Dashboard y cards
   - Mapas mentales (edges y selección)
   - Página de flashcards (banner de pendientes)
   - Juego de reordenamiento
   - Modo oscuro (si está implementado)

Los cambios son inmediatos y no requieren ninguna acción adicional.

