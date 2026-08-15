/**
 * EmotionEvents.ts
 * 
 * Defines the strict event payloads emitted by BloomEmotion.
 * These match the EventMap in BloomCore.
 */

import { EmotionState } from './EmotionState';

export interface EmotionUpdatedEvent {
  state: EmotionState;
}

export interface AnimationChangedEvent {
  animation: string;
}
