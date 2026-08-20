import { FaceState } from '../state/FaceState';

export enum AnimationLayer {
  IDLE = 'IDLE',
  EMOTION = 'EMOTION',
  SPECIAL = 'SPECIAL',
  SYSTEM = 'SYSTEM'
}

export enum AnimationPriority {
  IDLE = 10,
  EMOTION = 60,
  SPECIAL = 80,
  SYSTEM = 100
}

export interface IAnimation {
  id: string;
  layer: AnimationLayer;
  priority: AnimationPriority;
  weight: number; // 0.0 to 1.0
  
  start(): void;
  update(deltaTime: number): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  finish(): void;
  
  // Returns the target state this animation wants to achieve
  // Return null if this animation doesn't output a state right now
  getAnimState(): FaceState | null;
}
