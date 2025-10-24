/**
 * Funciones de utilidad para el estilo de nodos según el nivel
 */

// Paleta de colores para diferentes niveles
const levelColors = [
  { bg: "#7138F5", border: "#520DF2", text: "#FFFFFF" }, // Nivel 0 - Púrpura (raíz)
  { bg: "#0B64F4", border: "#0952C8", text: "#FFFFFF" }, // Nivel 1 - Azul
  { bg: "#0D9668", border: "#096C4B", text: "#FFFFFF" }, // Nivel 2 - Verde oscuro
  { bg: "#EB1414", border: "#C01111", text: "#FFFFFF" }, // Nivel 3 - Rojo
  { bg: "#C98208", border: "#9D6607", text: "#FFFFFF" }, // Nivel 4 - Marrón
  { bg: "#75A300", border: "#547500", text: "#FFFFFF" }, // Nivel 5 - Verde lima
  { bg: "#E7187F", border: "#BD1469", text: "#FFFFFF" }, // Nivel 6 - Rosa
  { bg: "#525252", border: "#424242", text: "#FFFFFF" }, // Nivel 7 - Gris
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
    fontSize: level === 0 ? "16px" : "15px",
    fontWeight: level === 0 ? "700" : "600",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    minWidth: level === 0 ? "120px" : "100px",
    textAlign: "center" as const,
  };
}





