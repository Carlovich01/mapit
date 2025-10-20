/**
 * SM-2 Algorithm for spaced repetition
 * Client-side implementation for preview/calculation
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
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetitions += 1;
  } else {
    // Incorrect response - restart
    repetitions = 0;
    interval = 1;
  }

  // Update easiness factor
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
