/**
 * EmotionState.ts
 * 
 * Defines the continuous numerical variables that represent Koru's internal
 * psychological state. All values are strictly clamped between 0 and 100.
 */

export type EmotionKey = 
  | 'Energy'
  | 'Stress'
  | 'Friendship'
  | 'Curiosity'
  | 'Confidence'
  | 'Trust'
  | 'Sleepiness'
  | 'Comfort'
  | 'BatteryMood'
  | 'PlantConcern'
  | 'Loneliness'
  | 'Excitement';

export type EmotionState = Record<EmotionKey, number>;

export const DEFAULT_EMOTION_STATE: EmotionState = {
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
