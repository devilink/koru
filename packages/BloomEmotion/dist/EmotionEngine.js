"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionEngine = void 0;
const EmotionState_1 = require("./EmotionState");
const EmotionCalculator_1 = require("./EmotionCalculator");
const EmotionDecay_1 = require("./EmotionDecay");
/**
 * EmotionEngine.ts
 *
 * The main orchestrator for Koru's psychological state.
 * Uses Constructor Injection to receive the Event Bus and Logger.
 */
class EmotionEngine {
    eventBus;
    logger;
    rules;
    animationState;
    state;
    currentAnimation = 'BLINK';
    constructor(eventBus, logger, rules, animationState, initialState = EmotionState_1.DEFAULT_EMOTION_STATE) {
        this.eventBus = eventBus;
        this.logger = logger;
        this.rules = rules;
        this.animationState = animationState;
        this.state = { ...initialState };
        this.setupSubscriptions();
        this.logger.info('BloomEmotion', 'Emotion Engine Initialized.');
    }
    /**
     * Wires the Event Bus to the Rule Engine.
     */
    setupSubscriptions() {
        // 1. Time tick for decay
        this.eventBus.subscribe('SYSTEM:TIME_TICK', () => {
            this.state = EmotionDecay_1.EmotionDecay.applyDecay(this.state);
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
    applyRules(event, payload) {
        const deltas = this.rules.evaluateRules(event, payload);
        // If rules matched and returned deltas
        if (Object.keys(deltas).length > 0) {
            this.logger.debug('BloomEmotion', `Applying deltas for ${event}`, deltas);
            this.state = EmotionCalculator_1.EmotionCalculator.applyDeltas(this.state, deltas);
            this.evaluateState();
        }
    }
    /**
     * Evaluates the current state to find the dominant animation and publishes updates.
     */
    evaluateState() {
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
    getState() {
        return { ...this.state };
    }
}
exports.EmotionEngine = EmotionEngine;
