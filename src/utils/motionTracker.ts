import * as Speech from 'expo-speech';

let lastAlertTime = 0;

export function evaluateFormAndCoaching(angle: number, threshold: number = 95) {
  if (angle === undefined || angle === null) return null;
  const now = Date.now();

  if (angle > 110) {
    if (now - lastAlertTime > 4000) {
      try {
        Speech.speak('Go deeper into your squat');
      } catch (e) {
        // Safe catch for web runtime
      }
      lastAlertTime = now;
    }
    return { status: 'WARNING', message: '⚠️ DIP DEEPER FOR FULL RANGE' };
  }

  if (angle <= threshold) {
    return { status: 'PERFECT', message: '🔥 PERFECT FORM DEPTH' };
  }

  return { status: 'OK', message: 'KEEP MOVING' };
}