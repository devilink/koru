import { EmotionState, DEFAULT_EMOTION_STATE } from './EmotionState';
import { EmotionRules } from './EmotionRules';
import { AnimationState } from './AnimationState';
import { EmotionCalculator } from './EmotionCalculator';
import { EmotionDecay } from './EmotionDecay';

// We import these interfaces to show how BloomEmotion depends on BloomCore interfaces
// rather than concrete implementations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ILogger {
  info(tag: string, message: string, meta?: any): void;
  debug(tag: string, message: string, meta?: any): void;
}

export interface IEventBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe(event: string, handler: (payload: any) => void): () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publish(event: string, payload: any): void;
}

/**
 * EmotionEngine.ts
 * 
 * The main orchestrator for Koru's psychological state.
 * Uses Constructor Injection to receive the Event Bus and Logger.
 */
export class EmotionEngine {
  private state: EmotionState;
  private currentAnimation: string = 'BLINK';

  constructor(
    private eventBus: IEventBus,
    private logger: ILogger,
    private rules: EmotionRules,
    private animationState: AnimationState,
    initialState: EmotionState = DEFAULT_EMOTION_STATE
  ) {
    this.state = { ...initialState };
    this.setupSubscriptions();
    this.logger.info('BloomEmotion', 'Emotion Engine Initialized.');
  }

  /**
   * Wires the Event Bus to the Rule Engine.
   */
  private setupSubscriptions(): void {
    // 1. Time tick for decay
    this.eventBus.subscribe('SYSTEM:TIME_TICK', () => {
      this.state = EmotionDecay.applyDecay(this.state);
      this.evaluateState();
    });

    // 2. Battery updates
    this.eventBus.subscribe('HARDWARE:BATTERY_UPDATED', (payload) => {
      this.applyRules('HARDWARE:BATTERY_UPDATED', payload);
    });

    // We can add more generic wildcard listeners or specific ones here as needed.
  }

  /**
   * Applies registered rules for a given event, calculates deltas, updates state, and evaluates.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyRules(event: string, payload: any): void {
    const deltas = this.rules.evaluateRules(event as any, payload);
    
    // If rules matched and returned deltas
    if (Object.keys(deltas).length > 0) {
      this.logger.debug('BloomEmotion', `Applying deltas for ${event}`, deltas);
      this.state = EmotionCalculator.applyDeltas(this.state, deltas);
      this.evaluateState();
    }
  }

  /**
   * Evaluates the current state to find the dominant animation and publishes updates.
   */
  private evaluateState(): void {
    // 1. Publish raw state update
    this.eventBus.publish('EMOTION:STATE_UPDATED', { state: this.state });

    // 2. Evaluate dominant animation
    const nextAnimation = this.animationState.getDominantAnimation(this.state);

    // 3. Publish if animation changed
    if (nextAnimation !== this.currentAnimation) {
      this.currentAnimation = nextAnimation;
      this.logger.info('BloomEmotion', `Animation changed to ${nextAnimation}`);
      this.eventBus.publish('EMOTION:ANIMATION_CHANGED', { animation: nextAnimation });
    }
  }

  /**
   * Gets the current raw state (mostly for testing).
   */
  public getState(): EmotionState {
    return { ...this.state };
  }
}
