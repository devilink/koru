import { FaceState } from "../state/FaceState";
import { IFaceAnimation } from "./Animation";

export class AnimationMixer {
  private activeAnimations: IFaceAnimation[] = [];

  addAnimation(anim: IFaceAnimation) {
    // Avoid duplicates by ID
    this.activeAnimations = this.activeAnimations.filter(a => a.id !== anim.id);
    this.activeAnimations.push(anim);
  }

  removeAnimation(id: string) {
    this.activeAnimations = this.activeAnimations.filter(a => a.id !== id);
  }

  clearAll() {
    this.activeAnimations = [];
  }

  /**
   * Applies all active animations over the baseState.
   * Modifies baseState (or a copy of it) and returns it.
   */
  update(deltaTime: number, baseState: FaceState): FaceState {
    const finalState = { ...baseState };

    // Clean up finished animations first
    this.activeAnimations = this.activeAnimations.filter(anim => !anim.isFinished());

    // Apply each active animation in order
    for (const anim of this.activeAnimations) {
      if (anim.weight <= 0) continue;

      const deltas = anim.update(deltaTime, finalState);
      
      // Additive or override blending based on weight.
      // For a simple implementation, we can just lerp towards the delta value based on weight.
      for (const [key, value] of Object.entries(deltas)) {
        const k = key as keyof FaceState;
        if (value !== undefined) {
          const original = finalState[k];
          finalState[k] = (original * (1 - anim.weight)) + (value * anim.weight);
        }
      }
    }

    return finalState;
  }
}
