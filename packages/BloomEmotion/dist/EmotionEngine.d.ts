import { EmotionState } from './EmotionState';
import { EmotionRules } from './EmotionRules';
import { AnimationState } from './AnimationState';
export interface ILogger {
    info(tag: string, message: string, meta?: any): void;
    debug(tag: string, message: string, meta?: any): void;
}
export interface IEventBus {
    subscribe(event: string, handler: (payload: any) => void): () => void;
    publish(event: string, payload: any): void;
}
/**
 * EmotionEngine.ts
 *
 * The main orchestrator for Koru's psychological state.
 * Uses Constructor Injection to receive the Event Bus and Logger.
 */
export declare class EmotionEngine {
    private eventBus;
    private logger;
    private rules;
    private animationState;
    private state;
    private currentAnimation;
    constructor(eventBus: IEventBus, logger: ILogger, rules: EmotionRules, animationState: AnimationState, initialState?: EmotionState);
    /**
     * Wires the Event Bus to the Rule Engine.
     */
    private setupSubscriptions;
    /**
     * Applies registered rules for a given event, calculates deltas, updates state, and evaluates.
     */
    private applyRules;
    /**
     * Evaluates the current state to find the dominant animation and publishes updates.
     */
    private evaluateState;
    /**
     * Gets the current raw state (mostly for testing).
     */
    getState(): EmotionState;
}
