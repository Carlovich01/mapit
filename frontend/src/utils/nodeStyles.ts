/**
 * Funciones de utilidad para el estilo de nodos según el nivel
 */

// Paleta de colores para diferentes niveles
const levelColors = [
  { bg: "#8B5CF6", border: "#7C3AED", text: "#FFFFFF" }, // Nivel 0 - Púrpura (raíz)
  { bg: "#3B82F6", border: "#2563EB", text: "#FFFFFF" }, // Nivel 1 - Azul
  { bg: "#10B981", border: "#059669", text: "#FFFFFF" }, // Nivel 2 - Verde
  { bg: "#F59E0B", border: "#D97706", text: "#FFFFFF" }, // Nivel 3 - Ámbar
  { bg: "#EF4444", border: "#DC2626", text: "#FFFFFF" }, // Nivel 4 - Rojo
  { bg: "#EC4899", border: "#DB2777", text: "#FFFFFF" }, // Nivel 5 - Rosa
  { bg: "#14B8A6", border: "#0D9488", text: "#FFFFFF" }, // Nivel 6 - Verde azulado
  { bg: "#F97316", border: "#EA580C", text: "#FFFFFF" }, // Nivel 7 - Naranja
];

/**
 * Obtener la configuración de color para un nivel específico
 */
export function getColorForLevel(level: number) {
  // Ciclar a través de los colores si el nivel excede el tamaño de la paleta
  const index = level % levelColors.length;
  return levelColors[index];
}

/**
 * Obtener el objeto de estilo para un nodo de ReactFlow según el nivel
 */
export function getNodeStyleForLevel(level: number) {
  const colors = getColorForLevel(level);

  return {
    background: colors.bg,
    color: colors.text,
    border: `2px solid ${colors.border}`,
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: level === 0 ? "16px" : "14px",
    fontWeight: level === 0 ? "700" : "600",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    minWidth: level === 0 ? "120px" : "100px",
    textAlign: "center" as const,
  };
}





