/**
 * Utilidades de validación de gráficos para el juego de reordenamiento
 */

export interface Edge {
  source: string;
  target: string;
}

function normalizeEdge(source: string, target: string): string {
  return [source, target].sort().join("-");
}

export function validateGraphStructure(
  originalEdges: Edge[],
  submittedEdges: Edge[]
): number {
  if (originalEdges.length === 0) {
    return submittedEdges.length === 0 ? 100 : 0;
  }

  const originalSet = new Set(
    originalEdges.map((e) => normalizeEdge(e.source, e.target))
  );

  const submittedSet = new Set(
    submittedEdges.map((e) => normalizeEdge(e.source, e.target))
  );

  // Contar bordes correctos
  let correctCount = 0;
  for (const edge of submittedSet) {
    if (originalSet.has(edge)) {
      correctCount++;
    }
  }

  // Calcular puntuación
  const score = Math.round((correctCount / originalSet.size) * 100);
  return score;
}

export function isExactMatch(
  originalEdges: Edge[],
  submittedEdges: Edge[]
): boolean {
  return validateGraphStructure(originalEdges, submittedEdges) === 100;
}
