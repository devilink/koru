import { IFaceAnimation } from "./Animation";
import { FaceState } from "../state/FaceState";
export class BlinkAnimation implements IFaceAnimation {
  id = "BlinkAnimation";
  weight = 1.0;
  
  private timeSinceLastBlink = 0;
  private nextBlinkInterval = 0;
  private isBlinking = false;
  private blinkProgress = 0; // 0 to 1
  private readonly blinkDuration = 150; // ms to close and open

  constructor() {
    this.scheduleNextBlink();
  }

  private scheduleNextBlink() {
    this.timeSinceLastBlink = 0;
    // Random blink interval between 2 and 6 seconds
    this.nextBlinkInterval = 2000 + Math.random() * 4000; 
  }

  update(deltaTime: number, currentState: FaceState): Partial<FaceState> {
    if (!this.isBlinking) {
      this.timeSinceLastBlink += deltaTime;
      if (this.timeSinceLastBlink >= this.nextBlinkInterval) {
        this.isBlinking = true;
        this.blinkProgress = 0;
      }
      return {};
    } else {
      this.blinkProgress += (deltaTime / this.blinkDuration);
      
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.scheduleNextBlink();
        return { leftEyeOpen: 1, rightEyeOpen: 1 };
      }

      // Sine wave mapping: 0 -> 1 -> 0 representing openness
      // progress 0 = open (1)
      // progress 0.5 = closed (0)
      // progress 1.0 = open (1)
      
      const openness = Math.abs(Math.cos(this.blinkProgress * Math.PI));
      return {
        leftEyeOpen: openness,
        rightEyeOpen: openness,
      };
    }
  }

  isFinished(): boolean {
    return false; // Blinking runs forever
  }
}
