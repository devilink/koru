import { FaceState } from "../state/FaceState";

export interface IFaceAnimation {
  id: string;
  weight: number; // 0.0 to 1.0 (how much it affects the final mix)
  
  /**
   * Updates the animation logic based on deltaTime.
   * Returns a Partial<FaceState> containing ONLY the properties this animation wants to modify.
   */
  update(deltaTime: number, currentState: FaceState): Partial<FaceState>;
  
  /**
   * Returns true if this animation is complete and should be removed from the mixer.
   */
  isFinished(): boolean;
}
