import gsap from 'gsap';
import { FaceState } from '../state/FaceState';
import { AnimationMixer } from './AnimationMixer';

export class IdleSystem {
  private _isActive: boolean = false;
  private blinkTimer: ReturnType<typeof setTimeout> | null = null;
  private microMoveTimer: ReturnType<typeof setTimeout> | null = null;

  // Local state purely for GSAP to animate offsets
  public offsets = {
    blinkHeight: 1.0, // multiplier
    xOffset: 0, // additive
    yOffset: 0, // additive
    rotOffset: 0, // additive
    mouthScaleOffset: 0 // additive
  };

  constructor(_mixer: AnimationMixer) {
    // Mixer reference available if needed in the future
  }

  public isActive(): boolean {
    return this._isActive;
  }

  public start() {
    if (this._isActive) return;
    this._isActive = true;
    this.scheduleBlink();
    this.scheduleMicroMove();
  }

  public pause() {
    this._isActive = false;
    this.clearTimers();
  }

  public resume() {
    if (!this._isActive) {
      this.start();
    }
  }

  public dispose() {
    this.pause();
    gsap.killTweensOf(this.offsets);
  }

  private clearTimers() {
    if (this.blinkTimer) clearTimeout(this.blinkTimer);
    if (this.microMoveTimer) clearTimeout(this.microMoveTimer);
    this.blinkTimer = null;
    this.microMoveTimer = null;
  }

  public applyToState(state: FaceState): FaceState {
    // Apply multipliers and additive offsets
    state.leftEye.height *= this.offsets.blinkHeight;
    state.rightEye.height *= this.offsets.blinkHeight;

    state.leftEye.x += this.offsets.xOffset;
    state.rightEye.x += this.offsets.xOffset;
    state.leftEye.y += this.offsets.yOffset;
    state.rightEye.y += this.offsets.yOffset;
    state.leftEye.rotation += this.offsets.rotOffset;
    state.rightEye.rotation += this.offsets.rotOffset;

    state.mouth.scale += this.offsets.mouthScaleOffset;
    
    return state;
  }

  public triggerBlink(onComplete?: () => void) {
    const duration = 0.05;
    const tl = gsap.timeline({ onComplete, defaults: { ease: 'power2.inOut' } });
    
    tl.to(this.offsets, { blinkHeight: 0.6, duration: duration })
      .to(this.offsets, { blinkHeight: 0.2, duration: duration * 0.8 })
      .to(this.offsets, { blinkHeight: 0.05, duration: duration * 0.5 })
      .to(this.offsets, { blinkHeight: 1.0, duration: duration * 2, ease: 'power1.out' });
  }

  private scheduleBlink() {
    if (!this._isActive) return;
    
    const nextBlinkDelay = 2000 + Math.random() * 3000;
    
    this.blinkTimer = setTimeout(() => {
      if (!this._isActive) return;

      this.triggerBlink(() => {
        if (Math.random() < 0.15 && this._isActive) {
          setTimeout(() => {
            if (this._isActive) this.triggerBlink();
          }, 100);
        }
      });
      
      this.scheduleBlink();
    }, nextBlinkDelay);
  }

  private scheduleMicroMove() {
    if (!this._isActive) return;
    
    const nextMoveDelay = 1500 + Math.random() * 2500;
    
    this.microMoveTimer = setTimeout(() => {
      if (!this._isActive) return;
      this.performMicroMove();
      this.scheduleMicroMove();
    }, nextMoveDelay);
  }

  private performMicroMove() {
    const type = Math.random();
    const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });

    if (type < 0.5) {
      // Subtle eye shift
      tl.to(this.offsets, {
        xOffset: (Math.random() - 0.5) * 5,
        yOffset: (Math.random() - 0.5) * 5,
        rotOffset: (Math.random() - 0.5) * 2,
        duration: 0.3
      })
      .to(this.offsets, {
        xOffset: 0,
        yOffset: 0,
        rotOffset: 0,
        duration: 0.5,
        delay: 0.2
      });
    } else {
      // Micro mouth shift
      tl.to(this.offsets, {
        mouthScaleOffset: (Math.random() - 0.5) * 0.05,
        duration: 0.3
      })
      .to(this.offsets, {
        mouthScaleOffset: 0,
        duration: 0.5,
        delay: 0.2
      });
    }
  }
}
