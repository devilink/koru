import { EmotionState, EmotionKey } from './EmotionState';
/**
 * EmotionCalculator.ts
 *
 * A pure utility that safely applies mathematical changes (deltas) to an EmotionState.
 * It ensures no value ever drops below 0 or goes above 100.
 */
export declare class EmotionCalculator {
    /**
     * Applies a set of deltas to a state and returns a new state object (immutability).
     */
    static applyDeltas(currentState: EmotionState, deltas: Partial<Record<EmotionKey, number>>): EmotionState;
    private static clamp;
}
