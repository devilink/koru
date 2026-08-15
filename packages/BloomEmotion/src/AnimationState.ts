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
  priority: number; // Lower number = higher priority
  evaluate: AnimationEvaluator;
}

export class AnimationState {
  private animations: AnimationDefinition[] = [];

  /**
   * Registers a new animation and its activation condition.
   */
  public registerAnimation(name: string, priority: number, evaluate: AnimationEvaluator): void {
    this.animations.push({ name, priority, evaluate });
    // Sort by priority (1 is highest priority)
    this.animations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Evaluates the current state against all registered animations in priority order.
   * Returns the name of the first animation whose evaluator returns true.
   * If none match, returns 'BLINK' (default idle).
   */
  public getDominantAnimation(state: EmotionState): string {
    for (const animation of this.animations) {
      if (animation.evaluate(state)) {
        return animation.name;
      }
    }
    return 'BLINK'; // Fallback idle animation
  }
}
