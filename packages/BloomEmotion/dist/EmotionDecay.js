"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionDecay = void 0;
const EmotionCalculator_1 = require("./EmotionCalculator");
const DECAY_RATES = {
    Stress: { target: 0, rate: 0.5 },
    Sleepiness: { target: 100, rate: 0.2 },
    Energy: { target: 0, rate: 0.1 },
    Excitement: { target: 0, rate: 1.0 },
    Loneliness: { target: 100, rate: 0.1 },
    Comfort: { target: 50, rate: 0.2 }
};
class EmotionDecay {
    /**
     * Applies the natural time decay to the state.
     */
    static applyDecay(currentState) {
        const deltas = {};
        for (const [key, profile] of Object.entries(DECAY_RATES)) {
            const k = key;
            const currentValue = currentState[k];
            if (currentValue < profile.target) {
                deltas[k] = Math.min(profile.rate, profile.target - currentValue);
            }
            else if (currentValue > profile.target) {
                deltas[k] = -Math.min(profile.rate, currentValue - profile.target);
            }
        }
        return EmotionCalculator_1.EmotionCalculator.applyDeltas(currentState, deltas);
    }
}
exports.EmotionDecay = EmotionDecay;
