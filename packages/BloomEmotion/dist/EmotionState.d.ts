/**
 * EmotionState.ts
 *
 * Defines the continuous numerical variables that represent Koru's internal
 * psychological state. All values are strictly clamped between 0 and 100.
 */
export type EmotionKey = 'Energy' | 'Stress' | 'Friendship' | 'Curiosity' | 'Confidence' | 'Trust' | 'Sleepiness' | 'Comfort' | 'BatteryMood' | 'PlantConcern' | 'Loneliness' | 'Excitement';
export type EmotionState = Record<EmotionKey, number>;
export declare const DEFAULT_EMOTION_STATE: EmotionState;
