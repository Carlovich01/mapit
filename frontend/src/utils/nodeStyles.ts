/**
 * Utility functions for node styling based on level
 */

// Color palette for different levels
const levelColors = [
  { bg: "#8B5CF6", border: "#7C3AED", text: "#FFFFFF" }, // Level 0 - Purple (root)
  { bg: "#3B82F6", border: "#2563EB", text: "#FFFFFF" }, // Level 1 - Blue
  { bg: "#10B981", border: "#059669", text: "#FFFFFF" }, // Level 2 - Green
  { bg: "#F59E0B", border: "#D97706", text: "#FFFFFF" }, // Level 3 - Amber
  { bg: "#EF4444", border: "#DC2626", text: "#FFFFFF" }, // Level 4 - Red
  { bg: "#EC4899", border: "#DB2777", text: "#FFFFFF" }, // Level 5 - Pink
  { bg: "#14B8A6", border: "#0D9488", text: "#FFFFFF" }, // Level 6 - Teal
  { bg: "#F97316", border: "#EA580C", text: "#FFFFFF" }, // Level 7 - Orange
];

/**
 * Get color configuration for a specific level
 */
export function getColorForLevel(level: number) {
  // Cycle through colors if level exceeds palette size
  const index = level % levelColors.length;
  return levelColors[index];
}

/**
 * Get style object for ReactFlow node based on level
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
