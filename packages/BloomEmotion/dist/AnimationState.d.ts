import { EmotionState } from './EmotionState';
/**
 * AnimationState.ts
 *
 * The Animation Selection Engine.
 * Evaluates the current EmotionState against a prioritized list of Animation Evaluators.
 * Removes hardcoded if/else chains.
 */
export type AnimationEvaluator = (state: EmotionState) => boolean;
export interface AnimationDefinition {
    name: string;
    priority: number;
    evaluate: AnimationEvaluator;
}
export declare class AnimationState {
    private animations;
    /**
     * Registers a new animation and its activation condition.
     */
    registerAnimation(name: string, priority: number, evaluate: AnimationEvaluator): void;
    /**
     * Evaluates the current state against all registered animations in priority order.
     * Returns the name of the first animation whose evaluator returns true.
     * If none match, returns 'BLINK' (default idle).
     */
    getDominantAnimation(state: EmotionState): string;
}
