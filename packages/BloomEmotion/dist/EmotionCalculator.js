"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionCalculator = void 0;
/**
 * EmotionCalculator.ts
 *
 * A pure utility that safely applies mathematical changes (deltas) to an EmotionState.
 * It ensures no value ever drops below 0 or goes above 100.
 */
class EmotionCalculator {
    /**
     * Applies a set of deltas to a state and returns a new state object (immutability).
     */
    static applyDeltas(currentState, deltas) {
        const newState = { ...currentState };
        for (const [key, delta] of Object.entries(deltas)) {
            const k = key;
            if (delta !== undefined) {
                newState[k] = this.clamp(newState[k] + delta);
            }
        }
        return newState;
    }
    static clamp(value) {
        return Math.max(0, Math.min(100, value));
    }
}
exports.EmotionCalculator = EmotionCalculator;
