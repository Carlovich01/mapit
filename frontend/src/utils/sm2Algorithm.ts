/**
 * Algoritmo SM-2 para repetición espaciada
 * Implementación del lado del cliente para previsualización/cálculo
 */

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
}

export function calculateSM2(
  quality: number,
  currentEF: number = 2.5,
  currentInterval: number = 0,
  currentRepetitions: number = 0
): SM2Result {
  let ef = currentEF;
  let interval = currentInterval;
  let repetitions = currentRepetitions;

  if (quality >= 3) {
    // Respuesta correcta
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetitions += 1;
  } else {
    // Respuesta incorrecta - reiniciar
    repetitions = 0;
    interval = 1;
  }

  // Actualizar el factor de facilidad
  ef = Math.max(
    1.3,
    ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    easinessFactor: ef,
    interval: interval,
    repetitions: repetitions,
  };
}
