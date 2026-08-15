"use strict";
/**
 * EmotionState.ts
 *
 * Defines the continuous numerical variables that represent Koru's internal
 * psychological state. All values are strictly clamped between 0 and 100.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_EMOTION_STATE = void 0;
exports.DEFAULT_EMOTION_STATE = {
    Energy: 100,
    Stress: 0,
    Friendship: 50,
    Curiosity: 50,
    Confidence: 50,
    Trust: 50,
    Sleepiness: 0,
    Comfort: 80,
    BatteryMood: 100,
    PlantConcern: 0,
    Loneliness: 0,
    Excitement: 0,
};
