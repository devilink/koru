import { FaceState } from "./FaceState";

export class FaceInterpolator {
  /**
   * Linearly interpolates between two numeric values.
   */
  static lerp(start: number, end: number, amt: number): number {
    return (1 - amt) * start + amt * end;
  }

  /**
   * Interpolates all properties of two FaceStates based on a progress value (0 to 1).
   */
  static lerpFaceState(start: FaceState, end: FaceState, progress: number): FaceState {
    const result: Partial<FaceState> = {};
    for (const key of Object.keys(start) as (keyof FaceState)[]) {
      result[key] = this.lerp(start[key], end[key], progress);
    }
    return result as FaceState;
  }
}
