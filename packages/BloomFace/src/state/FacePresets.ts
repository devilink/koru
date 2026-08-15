import { FaceState, createDefaultFaceState } from "./FaceState";

export const FacePresets: Record<string, FaceState> = {
  Neutral: {
    ...createDefaultFaceState(),
  },
  Cute: {
    ...createDefaultFaceState(),
    leftEyeScale: 1.2,
    rightEyeScale: 1.2,
    mouthSmile: 1.0,
    mouthWidth: 30,
    mouthHeight: 15,
  },
  Sleepy: {
    ...createDefaultFaceState(),
    leftEyeOpen: 0.2,
    rightEyeOpen: 0.2,
    mouthSmile: 0.0,
    mouthWidth: 15,
    mouthHeight: 5,
    rotation: -5,
  },
  Happy: {
    ...createDefaultFaceState(),
    leftEyeOpen: 1,
    rightEyeOpen: 1,
    mouthSmile: 1.0,
    mouthWidth: 40,
    mouthHeight: 20,
    rotation: 0,
  },
  Surprised: {
    ...createDefaultFaceState(),
    leftEyeScale: 1.3,
    rightEyeScale: 1.3,
    mouthOpen: 1.0,
    mouthWidth: 20,
    mouthHeight: 30,
    mouthSmile: 0.0,
  }
};
