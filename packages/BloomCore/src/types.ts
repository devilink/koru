export type EventType = 
  | 'FACE_DETECTED'
  | 'MOTION_DETECTED'
  | 'SPEECH_RECOGNIZED'
  | 'EMOTION_STATE_UPDATED'
  | 'HARDWARE_TILT'
  | 'SYSTEM_READY'
  | 'AnimationChanged'
  | 'SUDDEN_MOTION'
  | 'UNKNOWN_PERSON';

export interface BloomEvent<T = any> {
  type: EventType;
  payload: T;
  timestamp: number;
  source: string;
}

export type EventHandler = (event: BloomEvent) => void;
