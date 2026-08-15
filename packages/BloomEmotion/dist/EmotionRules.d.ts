import { EmotionKey } from './EmotionState';
import { EventKey } from '@koru/bloomcore';
/**
 * EmotionRules.ts
 *
 * Defines how external events translate into emotional deltas.
 */
export type RuleEvaluator<K extends EventKey> = (payload: any) => Partial<Record<EmotionKey, number>>;
export declare class EmotionRules {
    private rules;
    /**
     * Registers a rule mapping an event to an emotional delta.
     */
    registerRule<K extends EventKey>(event: K, evaluator: RuleEvaluator<K>): void;
    /**
     * Evaluates all rules for a given event and returns the combined delta.
     */
    evaluateRules(event: EventKey, payload: any): Partial<Record<EmotionKey, number>>;
}
