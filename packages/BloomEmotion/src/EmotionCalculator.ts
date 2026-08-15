import { EmotionState, EmotionKey } from './EmotionState';

/**
 * EmotionCalculator.ts
 * 
 * A pure utility that safely applies mathematical changes (deltas) to an EmotionState.
 * It ensures no value ever drops below 0 or goes above 100.
 */
export class EmotionCalculator {
  /**
   * Applies a set of deltas to a state and returns a new state object (immutability).
   */
  public static applyDeltas(
    currentState: EmotionState, 
    deltas: Partial<Record<EmotionKey, number>>
  ): EmotionState {
    const newState = { ...currentState };

    for (const [key, delta] of Object.entries(deltas)) {
      const k = key as EmotionKey;
      if (delta !== undefined) {
        newState[k] = this.clamp(newState[k] + delta);
      }
    }

    return newState;
  }

  private static clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
