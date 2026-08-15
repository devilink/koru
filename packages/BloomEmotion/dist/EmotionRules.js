"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionRules = void 0;
class EmotionRules {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rules = new Map();
    /**
     * Registers a rule mapping an event to an emotional delta.
     */
    registerRule(event, evaluator) {
        if (!this.rules.has(event)) {
            this.rules.set(event, []);
        }
        this.rules.get(event).push(evaluator);
    }
    /**
     * Evaluates all rules for a given event and returns the combined delta.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluateRules(event, payload) {
        const evaluators = this.rules.get(event) || [];
        const combinedDelta = {};
        for (const evaluator of evaluators) {
            const delta = evaluator(payload);
            for (const [key, value] of Object.entries(delta)) {
                const k = key;
                combinedDelta[k] = (combinedDelta[k] || 0) + value;
            }
        }
        return combinedDelta;
    }
}
exports.EmotionRules = EmotionRules;
