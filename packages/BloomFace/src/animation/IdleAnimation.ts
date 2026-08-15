import { IFaceAnimation } from "./Animation";
import { FaceState } from "../state/FaceState";

export class IdleAnimation implements IFaceAnimation {
  id = "IdleAnimation";
  weight = 1.0;
  
  private time = 0;

  update(deltaTime: number, currentState: FaceState): Partial<FaceState> {
    this.time += deltaTime;

    // Subtle floating breathing effect
    // We'll slightly affect eye scales and mouth width to simulate life
    
    // Slow sine wave (every 3 seconds)
    const breath = Math.sin(this.time / 3000 * Math.PI * 2);
    
    // Small micro-movements
    const eyeScaleMod = breath * 0.05; // +/- 5% scale
    
    return {
      leftEyeScale: currentState.leftEyeScale + eyeScaleMod,
      rightEyeScale: currentState.rightEyeScale + eyeScaleMod,
      mouthWidth: currentState.mouthWidth + (breath * 1), // small mouth expansion
    };
  }

  isFinished(): boolean {
    return false; // Idle runs forever
  }
}
