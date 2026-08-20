export type MouthType = 'neutral' | 'tiny-smile' | 'smile' | 'sad' | 'open';

export interface FaceState {
  leftEye: {
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
  };
  rightEye: {
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
  };
  mouth: {
    selection: MouthType;
    scale: number;
    x: number;
    y: number;
  };
}

export const initialFaceState: FaceState = {
  leftEye: {
    width: 1.0,
    height: 1.0,
    x: -150,
    y: -50,
    rotation: 0,
  },
  rightEye: {
    width: 1.0,
    height: 1.0,
    x: 150,
    y: -50,
    rotation: 0,
  },
  mouth: {
    selection: 'neutral',
    scale: 1.0,
    x: 0,
    y: 150,
  }
};

export const cloneState = (state: FaceState): FaceState => {
  return JSON.parse(JSON.stringify(state));
};

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export const lerpState = (a: FaceState, b: FaceState, t: number): FaceState => {
  // Clamp t between 0 and 1
  t = Math.max(0, Math.min(1, t));
  return {
    leftEye: {
      width: lerp(a.leftEye.width, b.leftEye.width, t),
      height: lerp(a.leftEye.height, b.leftEye.height, t),
      x: lerp(a.leftEye.x, b.leftEye.x, t),
      y: lerp(a.leftEye.y, b.leftEye.y, t),
      rotation: lerp(a.leftEye.rotation, b.leftEye.rotation, t),
    },
    rightEye: {
      width: lerp(a.rightEye.width, b.rightEye.width, t),
      height: lerp(a.rightEye.height, b.rightEye.height, t),
      x: lerp(a.rightEye.x, b.rightEye.x, t),
      y: lerp(a.rightEye.y, b.rightEye.y, t),
      rotation: lerp(a.rightEye.rotation, b.rightEye.rotation, t),
    },
    mouth: {
      selection: t > 0.5 ? b.mouth.selection : a.mouth.selection,
      scale: lerp(a.mouth.scale, b.mouth.scale, t),
      x: lerp(a.mouth.x, b.mouth.x, t),
      y: lerp(a.mouth.y, b.mouth.y, t),
    }
  };
};
