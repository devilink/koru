/**
 * EventMap.ts
 * 
 * Central registry of all events in BloomOS.
 * This guarantees compile-time validation of event payloads across all packages.
 * 
 * As new features (Vision, Voice, Emotion) are added, their events must be registered here.
 */

// Example payload interfaces for future scalability
export interface FaceDetectedPayload {
  x: number;
  y: number;
  confidence: number;
  timestamp: number;
}

export interface EmotionChangedPayload {
  emotionId: string;
  intensity: number;
}

export interface PlantHealthPayload {
  moistureLevel: number;
  lightLevel: number;
  status: 'healthy' | 'needs_water' | 'needs_light';
}

export interface BatteryUpdatedPayload {
  level: number; // 0-100
  isCharging: boolean;
}

export interface AnimationChangedPayload {
  animation: string;
}

export interface EmotionUpdatedPayload {
  state: Record<string, number>;
}

/**
 * The global event map.
 * Keys are the event names, values are the strictly typed payloads.
 */
export type EventMap = {
  'VISION:FACE_DETECTED': FaceDetectedPayload;
  'PLANT:HEALTH_UPDATED': PlantHealthPayload;
  'SYSTEM:READY': { timestamp: number };
  
  // Milestone 3 Events
  'SYSTEM:TIME_TICK': { timestamp: number };
  'HARDWARE:BATTERY_UPDATED': BatteryUpdatedPayload;
  'EMOTION:STATE_UPDATED': EmotionUpdatedPayload;
  'EMOTION:ANIMATION_CHANGED': AnimationChangedPayload;
  'USER:INTERACTION': { timestamp?: number };
};

export type EventKey = keyof EventMap;
