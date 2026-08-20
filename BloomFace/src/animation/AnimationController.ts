import gsap from 'gsap';
import { FaceState } from '../state/FaceState';
import { AnimationMixer } from './AnimationMixer';
import { IAnimation, AnimationLayer, AnimationPriority } from './AnimationTypes';
import { 
  getLoveState, 
  getCryState, 
  getSleepState, 
  getUncomfortableState, 
  getExtremeCuteState, 
  getResetState 
} from './ExpressionAnimations';

class OverrideAnimation implements IAnimation {
  public id: string;
  public layer: AnimationLayer;
  public priority: AnimationPriority;
  public weight: number = 0;
  
  private targetState: FaceState;
  private duration: number;
  private tl: gsap.core.Timeline | null = null;
  private onFinished?: () => void;

  constructor(id: string, layer: AnimationLayer, priority: AnimationPriority, targetState: FaceState, duration = 0.5, onFinished?: () => void) {
    this.id = id;
    this.layer = layer;
    this.priority = priority;
    this.targetState = targetState;
    this.duration = duration;
    this.onFinished = onFinished;
  }

  start(): void {
    this.tl = gsap.timeline();
    this.tl.to(this, { weight: 1, duration: this.duration, ease: 'power2.inOut' });
  }

  update(_deltaTime: number): void {
    // GSAP handles the weight tweening, nothing manual needed here
  }

  pause(): void {
    this.tl?.pause();
  }

  resume(): void {
    this.tl?.resume();
  }

  cancel(): void {
    this.tl?.kill();
    this.weight = 0;
    (this as any)._finished = true;
  }

  finish(): void {
    this.tl?.kill();
    this.tl = gsap.timeline({ onComplete: () => {
      (this as any)._finished = true;
      if (this.onFinished) this.onFinished();
    }});
    this.tl.to(this, { weight: 0, duration: this.duration, ease: 'power2.inOut' });
  }

  getAnimState(): FaceState | null {
    return this.targetState;
  }
}

export class AnimationController {
  private mixer: AnimationMixer;
  
  constructor(onStateUpdate: (state: FaceState) => void) {
    this.mixer = new AnimationMixer(onStateUpdate);
  }

  public getMixer(): AnimationMixer {
    return this.mixer;
  }

  public startIdle() {
    this.mixer.start();
  }

  public dispose() {
    this.mixer.stop();
  }

  // --- EMOTION LAYER (Changes Base State) ---
  
  public playLove() {
    this.mixer.transitionBaseState(getLoveState());
  }

  public playCry() {
    this.mixer.transitionBaseState(getCryState());
  }

  public playSleep() {
    this.mixer.transitionBaseState(getSleepState());
  }

  public playUncomfortable() {
    this.mixer.transitionBaseState(getUncomfortableState());
  }

  public resetFace() {
    this.mixer.transitionBaseState(getResetState());
  }

  // --- SPECIAL LAYER (Temporary Override) ---

  public playExtremeCute(durationMs: number = 3000) {
    const anim = new OverrideAnimation(
      'extreme_cute', 
      AnimationLayer.SPECIAL, 
      AnimationPriority.SPECIAL, 
      getExtremeCuteState(), 
      0.5,
      () => {
        // Auto remove handled by mixer
      }
    );
    this.mixer.addAnimation(anim);

    // Auto-finish after duration
    setTimeout(() => {
      anim.finish();
    }, durationMs);
  }
}
