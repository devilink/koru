import { FaceState, cloneState, initialFaceState } from '../state/FaceState';

const deepMerge = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
};

const createTargetState = (partial: any): FaceState => {
  const state = cloneState(initialFaceState);
  return deepMerge(state, partial);
};

export const getLoveState = (): FaceState => createTargetState({
  leftEye: { width: 1.5, height: 1.5, y: -60, rotation: 0, x: -150 },
  rightEye: { width: 1.5, height: 1.5, y: -60, rotation: 0, x: 150 },
  mouth: { selection: 'smile', scale: 1.2, y: 130, x: 0 }
});

export const getCryState = (): FaceState => createTargetState({
  leftEye: { width: 1.0, height: 0.6, rotation: 15, y: -40, x: -150 },
  rightEye: { width: 1.0, height: 0.6, rotation: -15, y: -40, x: 150 },
  mouth: { selection: 'sad', scale: 1.0, y: 160, x: 0 }
});

export const getSleepState = (): FaceState => createTargetState({
  leftEye: { width: 1.0, height: 0.05, rotation: 0, y: -50, x: -150 },
  rightEye: { width: 1.0, height: 0.05, rotation: 0, y: -50, x: 150 },
  mouth: { selection: 'neutral', scale: 0.8, y: 150, x: 0 }
});

export const getUncomfortableState = (): FaceState => createTargetState({
  leftEye: { width: 0.8, height: 0.8, rotation: 0, y: -50, x: -150 },
  rightEye: { width: 1.2, height: 1.2, rotation: 0, y: -50, x: 150 },
  mouth: { selection: 'sad', scale: 0.9, y: 150, x: 20 }
});

export const getExtremeCuteState = (): FaceState => createTargetState({
  leftEye: { width: 1.8, height: 1.8, rotation: -5, y: -70, x: -120 },
  rightEye: { width: 1.8, height: 1.8, rotation: 5, y: -70, x: 120 },
  mouth: { selection: 'open', scale: 1.1, y: 120, x: 0 }
});

export const getResetState = (): FaceState => cloneState(initialFaceState);

