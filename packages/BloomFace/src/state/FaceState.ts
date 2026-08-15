export interface FaceState {
  // Eyes
  leftEyeOpen: number; // 0.0 (closed) to 1.0 (open)
  rightEyeOpen: number;
  leftEyeScale: number; 
  rightEyeScale: number;
  
  // Pupils (Look direction, relative to center 0,0)
  leftPupilX: number;
  leftPupilY: number;
  rightPupilX: number;
  rightPupilY: number;
  leftPupilScale: number;
  rightPupilScale: number;
  
  // Mouth
  mouthSmile: number; // -1.0 (frown) to 1.0 (smile)
  mouthOpen: number;  // 0.0 to 1.0
  mouthWidth: number;
  mouthHeight: number;
  
  // Global Modifiers
  rotation: number;   // Head tilt in degrees
  glow: number;       // Global opacity/glow strength
}

export const createDefaultFaceState = (): FaceState => ({
  leftEyeOpen: 1,
  rightEyeOpen: 1,
  leftEyeScale: 1,
  rightEyeScale: 1,
  leftPupilX: 0,
  leftPupilY: 0,
  rightPupilX: 0,
  rightPupilY: 0,
  leftPupilScale: 1,
  rightPupilScale: 1,
  mouthSmile: 0,
  mouthOpen: 0,
  mouthWidth: 20,
  mouthHeight: 10,
  rotation: 0,
  glow: 1,
});
