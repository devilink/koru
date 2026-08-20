import gsap from 'gsap';
import { FaceState, cloneState, lerpState, initialFaceState } from '../state/FaceState';
import { IAnimation } from './AnimationTypes';
import { IdleSystem } from './IdleSystem';

export class AnimationMixer {
  private baseState: FaceState;
  private activeAnimations: IAnimation[] = [];
  private onStateUpdate: (state: FaceState) => void;
  public idleSystem: IdleSystem;
  private isRunning: boolean = false;

  constructor(onStateUpdate: (state: FaceState) => void) {
    this.baseState = cloneState(initialFaceState);
    this.onStateUpdate = onStateUpdate;
    this.idleSystem = new IdleSystem(this);
  }

  public getBaseState(): FaceState {
    return this.baseState;
  }

  public setBaseState(newState: FaceState) {
    this.baseState = cloneState(newState);
  }

  public transitionBaseState(newState: FaceState, duration: number = 0.5) {
    gsap.to(this.baseState.leftEye, { ...newState.leftEye, duration, ease: 'power2.out' });
    gsap.to(this.baseState.rightEye, { ...newState.rightEye, duration, ease: 'power2.out' });
    
    // Switch mouth immediately at halfway point
    setTimeout(() => {
      this.baseState.mouth.selection = newState.mouth.selection;
    }, (duration * 1000) / 2);

    gsap.to(this.baseState.mouth, { 
      scale: newState.mouth.scale,
      x: newState.mouth.x,
      y: newState.mouth.y,
      duration, 
      ease: 'power2.out' 
    });
  }

  public addAnimation(anim: IAnimation) {
    // Remove any existing animation with the same ID
    this.removeAnimation(anim.id);
    this.activeAnimations.push(anim);
    
    // Sort ascending by priority so higher priorities are applied last (overwriting lower ones)
    this.activeAnimations.sort((a, b) => a.priority - b.priority);
    
    anim.start();
  }

  public removeAnimation(id: string) {
    const index = this.activeAnimations.findIndex(a => a.id === id);
    if (index !== -1) {
      this.activeAnimations[index].cancel();
      this.activeAnimations.splice(index, 1);
    }
  }

  public getActiveAnimations(): IAnimation[] {
    return this.activeAnimations;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.idleSystem.start();
    
    // Bind the update loop to GSAP's ticker
    gsap.ticker.add(this.update);
  }

  public stop() {
    this.isRunning = false;
    this.idleSystem.dispose();
    gsap.ticker.remove(this.update);
    this.activeAnimations.forEach(a => a.cancel());
    this.activeAnimations = [];
  }

  private update = (_time: number, deltaTime: number, _frame: number) => {
    // 1. Start with the Base State
    let finalState = cloneState(this.baseState);

    // 2. Apply Idle Offsets (Priority 10)
    // Idle is applied directly to the base state before other animations
    if (this.idleSystem.isActive()) {
      finalState = this.idleSystem.applyToState(finalState);
    }

    // 3. Composite active animations based on their weight
    // Animations are already sorted lowest to highest priority
    for (let i = 0; i < this.activeAnimations.length; i++) {
      const anim = this.activeAnimations[i];
      
      // Update animation logic (let it mutate its internal GSAP timelines)
      anim.update(deltaTime);
      
      const animState = anim.getAnimState();
      if (animState && anim.weight > 0) {
        finalState = lerpState(finalState, animState, anim.weight);
      }
      
      // Cleanup finished animations
      if (anim.weight <= 0 && (anim as any)._finished) {
        this.activeAnimations.splice(i, 1);
        i--;
      }
    }

    // 4. Output final state to React
    this.onStateUpdate(finalState);
  };
}
