import { EmotionState, EmotionKey } from './EmotionState';
import { EmotionCalculator } from './EmotionCalculator';

/**
 * EmotionDecay.ts
 * 
 * Defines the natural drift of emotions over time.
 * This ensures Koru feels alive even when no events are happening.
 */

// Define how much each emotion drifts per TIME_TICK, and what its baseline is.
interface DecayProfile {
  target: number;
  rate: number;
}

const DECAY_RATES: Partial<Record<EmotionKey, DecayProfile>> = {
  Stress: { target: 0, rate: 0.5 },
  Sleepiness: { target: 100, rate: 0.2 },
  Energy: { target: 0, rate: 0.1 },
  Excitement: { target: 0, rate: 1.0 },
  Loneliness: { target: 100, rate: 0.1 },
  Comfort: { target: 50, rate: 0.2 }
};

export class EmotionDecay {
  /**
   * Applies the natural time decay to the state.
   */
  public static applyDecay(currentState: EmotionState): EmotionState {
    const deltas: Partial<Record<EmotionKey, number>> = {};

    for (const [key, profile] of Object.entries(DECAY_RATES)) {
      const k = key as EmotionKey;
      const currentValue = currentState[k];
      
      if (currentValue < profile.target) {
        deltas[k] = Math.min(profile.rate, profile.target - currentValue);
      } else if (currentValue > profile.target) {
        deltas[k] = -Math.min(profile.rate, currentValue - profile.target);
      }
    }

    return EmotionCalculator.applyDeltas(currentState, deltas);
  }
}
