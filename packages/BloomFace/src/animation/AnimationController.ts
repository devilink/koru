import { AnimationMixer } from "./AnimationMixer";
import { FaceState } from "../state/FaceState";
import { FacePresets } from "../state/FacePresets";
import { FaceInterpolator } from "../state/FaceInterpolator";
import { BlinkAnimation } from "./BlinkAnimation";
import { IdleAnimation } from "./IdleAnimation";

export class AnimationController {
  private mixer: AnimationMixer;
  
  // The state we are trying to reach (e.g. from setting a Preset)
  private targetBaseState: FaceState;
  
  // The current base state (interpolated over time towards targetBaseState)
  private currentBaseState: FaceState;
  
  // The final state after mixer has applied animations
  private finalState: FaceState;
  
  private lastTime = 0;
  
  // Transition speed for changing presets
  private transitionSpeed = 5.0; // multiplier per second

  // Callback to notify UI of state changes
  private onUpdateCallback?: (state: FaceState) => void;

  constructor() {
    this.mixer = new AnimationMixer();
    
    // Start with Neutral
    this.targetBaseState = { ...FacePresets.Neutral };
    this.currentBaseState = { ...FacePresets.Neutral };
    this.finalState = { ...FacePresets.Neutral };

    // Add default procedural animations
    this.mixer.addAnimation(new BlinkAnimation());
    this.mixer.addAnimation(new IdleAnimation());
  }

  setUpdateCallback(cb: (state: FaceState) => void) {
    this.onUpdateCallback = cb;
  }

  setPreset(presetName: string) {
    if (FacePresets[presetName]) {
      this.targetBaseState = { ...FacePresets[presetName] };
    } else {
      console.warn(`Preset ${presetName} not found!`);
    }
  }

  /**
   * Called on every RequestAnimationFrame or GSAP ticker tick
   */
  update(time: number) {
    const deltaTime = this.lastTime === 0 ? 0 : time - this.lastTime;
    this.lastTime = time;

    // 1. Move currentBaseState towards targetBaseState for smooth preset transitions
    const dtSeconds = deltaTime / 1000;
    const progress = Math.min(1.0, dtSeconds * this.transitionSpeed);
    
    this.currentBaseState = FaceInterpolator.lerpFaceState(
      this.currentBaseState,
      this.targetBaseState,
      progress
    );

    // 2. Mix procedural animations on top of the current base state
    this.finalState = this.mixer.update(deltaTime, this.currentBaseState);

    // 3. Dispatch to renderer
    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.finalState);
    }
  }
}
