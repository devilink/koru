import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  EmotionCalculator, 
  EmotionDecay, 
  EmotionRules, 
  AnimationState, 
  EmotionEngine, 
  DEFAULT_EMOTION_STATE,
  ILogger,
  IEventBus
} from '../src';

describe('BloomEmotion Comprehensive Verification', () => {
  let mockEventBus: IEventBus;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockEventBus = {
      publish: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {})
    };
    mockLogger = {
      info: vi.fn(),
      debug: vi.fn()
    };
  });

  describe('EmotionCalculator (Boundary Verification)', () => {
    it('prevents values from exceeding 100', () => {
      const state = { ...DEFAULT_EMOTION_STATE, Energy: 90 };
      const newState = EmotionCalculator.applyDeltas(state, { Energy: 50 });
      expect(newState.Energy).toBe(100);
    });

    it('prevents values from dropping below 0', () => {
      const state = { ...DEFAULT_EMOTION_STATE, Stress: 10 };
      const newState = EmotionCalculator.applyDeltas(state, { Stress: -50 });
      expect(newState.Stress).toBe(0);
    });

    it('does not mutate the original state object', () => {
      const originalState = { ...DEFAULT_EMOTION_STATE };
      const newState = EmotionCalculator.applyDeltas(originalState, { Energy: -10 });
      expect(originalState.Energy).toBe(100);
      expect(newState.Energy).toBe(90);
    });
  });

  describe('EmotionDecay (Time-Based Drift)', () => {
    it('drifts multiple values towards their specific baselines correctly', () => {
      const state = { 
        ...DEFAULT_EMOTION_STATE, 
        Stress: 50, 
        Sleepiness: 20, 
        Energy: 100 
      };
      const nextState = EmotionDecay.applyDecay(state);
      
      // Stress target is 0, rate is 0.5
      expect(nextState.Stress).toBe(49.5); 
      // Sleepiness target is 100, rate is 0.2
      expect(nextState.Sleepiness).toBe(20.2);
      // Energy target is 0, rate is 0.1
      expect(nextState.Energy).toBe(99.9);
    });
  });

  describe('EmotionRules (Rule Engine Isolation)', () => {
    it('applies rules independently and combines deltas', () => {
      const rules = new EmotionRules();
      
      // Rule 1: Battery < 15
      rules.registerRule('HARDWARE:BATTERY_UPDATED', (payload: { level: number }) => {
        return payload.level < 15 ? { Energy: -20, Stress: 10 } : {};
      });

      // Rule 2: General battery drop
      rules.registerRule('HARDWARE:BATTERY_UPDATED', (payload: { level: number }) => {
        return { BatteryMood: payload.level - 100 }; // Simplify for test
      });

      const deltas = rules.evaluateRules('HARDWARE:BATTERY_UPDATED', { level: 10 });
      
      expect(deltas.Energy).toBe(-20);
      expect(deltas.Stress).toBe(10);
      expect(deltas.BatteryMood).toBe(-90);
    });

    it('returns empty deltas if no rules match', () => {
      const rules = new EmotionRules();
      const deltas = rules.evaluateRules('NON_EXISTENT_EVENT', {});
      expect(Object.keys(deltas).length).toBe(0);
    });
  });

  describe('AnimationState (Priority Evaluation)', () => {
    let anims: AnimationState;

    beforeEach(() => {
      anims = new AnimationState();
      anims.registerAnimation('SLEEP', 1, (state) => state.Sleepiness > 80);
      anims.registerAnimation('CRY', 2, (state) => state.Stress > 80);
      anims.registerAnimation('UNCOMFORTABLE', 3, (state) => state.PlantConcern > 70);
      anims.registerAnimation('LOVE', 4, (state) => state.Friendship > 80);
    });

    it('selects highest priority animation when multiple conditions are met', () => {
      const state = { 
        ...DEFAULT_EMOTION_STATE, 
        Sleepiness: 90, // Sleep (1)
        Stress: 90,     // Cry (2)
        Friendship: 90  // Love (4)
      };
      expect(anims.getDominantAnimation(state)).toBe('SLEEP');
    });

    it('selects lower priority if higher priorities are not met', () => {
      const state = { 
        ...DEFAULT_EMOTION_STATE, 
        Sleepiness: 50,
        Stress: 50,
        Friendship: 90 
      };
      expect(anims.getDominantAnimation(state)).toBe('LOVE');
    });

    it('defaults to BLINK if no conditions match', () => {
      expect(anims.getDominantAnimation(DEFAULT_EMOTION_STATE)).toBe('BLINK');
    });
  });

  describe('EmotionEngine (Orchestration & SOLID Verification)', () => {
    it('subscribes to EventBus and reacts to TIME_TICK', () => {
      const rules = new EmotionRules();
      const anims = new AnimationState();
      new EmotionEngine(mockEventBus, mockLogger, rules, anims);

      expect(mockEventBus.subscribe).toHaveBeenCalledWith('SYSTEM:TIME_TICK', expect.any(Function));
    });

    it('publishes state updates without tight coupling', () => {
      const rules = new EmotionRules();
      const anims = new AnimationState();
      const engine = new EmotionEngine(mockEventBus, mockLogger, rules, anims);

      // Force evaluate
      (engine as any).evaluateState();

      expect(mockEventBus.publish).toHaveBeenCalledWith('EMOTION:STATE_UPDATED', {
        state: DEFAULT_EMOTION_STATE
      });
    });
  });
});
