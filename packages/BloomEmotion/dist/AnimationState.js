"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationState = void 0;
class AnimationState {
    animations = [];
    /**
     * Registers a new animation and its activation condition.
     */
    registerAnimation(name, priority, evaluate) {
        this.animations.push({ name, priority, evaluate });
        // Sort by priority (1 is highest priority)
        this.animations.sort((a, b) => a.priority - b.priority);
    }
    /**
     * Evaluates the current state against all registered animations in priority order.
     * Returns the name of the first animation whose evaluator returns true.
     * If none match, returns 'BLINK' (default idle).
     */
    getDominantAnimation(state) {
        for (const animation of this.animations) {
            if (animation.evaluate(state)) {
                return animation.name;
            }
        }
        return 'BLINK'; // Fallback idle animation
    }
}
exports.AnimationState = AnimationState;
