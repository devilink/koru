import { EmotionKey, EmotionState } from './EmotionState';
import { EventKey, EventMap } from '@koru/bloomcore'; // Assuming this is how it will be imported

/**
 * EmotionRules.ts
 * 
 * Defines how external events translate into emotional deltas.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuleEvaluator<K extends EventKey> = (payload: any) => Partial<Record<EmotionKey, number>>;

export class EmotionRules {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private rules = new Map<EventKey, RuleEvaluator<any>[]>();

  /**
   * Registers a rule mapping an event to an emotional delta.
   */
  public registerRule<K extends EventKey>(event: K, evaluator: RuleEvaluator<K>): void {
    if (!this.rules.has(event)) {
      this.rules.set(event, []);
    }
    this.rules.get(event)!.push(evaluator);
  }

  /**
   * Evaluates all rules for a given event and returns the combined delta.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public evaluateRules(event: EventKey, payload: any): Partial<Record<EmotionKey, number>> {
    const evaluators = this.rules.get(event) || [];
    const combinedDelta: Partial<Record<EmotionKey, number>> = {};

    for (const evaluator of evaluators) {
      const delta = evaluator(payload);
      for (const [key, value] of Object.entries(delta)) {
        const k = key as EmotionKey;
        combinedDelta[k] = (combinedDelta[k] || 0) + (value as number);
      }
    }

    return combinedDelta;
  }
}
