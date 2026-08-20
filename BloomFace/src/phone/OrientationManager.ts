export type PermissionState = 'PENDING' | 'GRANTED' | 'DENIED' | 'UNAVAILABLE' | 'READY' | 'UNSUPPORTED';

export interface OrientationData {
  // Rotation
  alpha: number | null; // Z-axis rotation
  beta: number | null;  // X-axis rotation (front-to-back tilt)
  gamma: number | null; // Y-axis rotation (left-to-right tilt)
  // Acceleration
  x: number | null;
  y: number | null;
  z: number | null;
}

export class OrientationManager {
  private isListening = false;
  private currentData: OrientationData = { 
    alpha: null, beta: null, gamma: null,
    x: null, y: null, z: null
  };
  private permissionState: PermissionState = 'PENDING';

  public async requestPermissionAndStart(): Promise<boolean> {
    if (!window.DeviceOrientationEvent || !window.DeviceMotionEvent) {
      this.permissionState = 'UNSUPPORTED';
      console.warn('[OrientationManager] Hardware unsupported.');
      return false;
    }

    // iOS 13+ requires explicit permission for device orientation and motion
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState !== 'granted') {
          console.warn('[OrientationManager] Orientation permission denied by user.');
          this.permissionState = 'DENIED';
          return false;
        }
        
        // Request motion permission as well
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const motionState = await (DeviceMotionEvent as any).requestPermission();
          if (motionState !== 'granted') {
             console.warn('[OrientationManager] Motion permission denied by user.');
             this.permissionState = 'DENIED';
             return false;
          }
        }
      } catch (err) {
        console.error('[OrientationManager] Error requesting permission.', err);
        this.permissionState = 'DENIED';
        return false;
      }
    }

    // Start listening
    if (!this.isListening) {
      window.addEventListener('deviceorientation', this.handleOrientation);
      window.addEventListener('devicemotion', this.handleMotion);
      this.isListening = true;
      this.permissionState = 'READY';
      console.log('[OrientationManager] Started successfully.');
    }
    
    return true;
  }

  public stop() {
    if (this.isListening) {
      window.removeEventListener('deviceorientation', this.handleOrientation);
      window.removeEventListener('devicemotion', this.handleMotion);
      this.isListening = false;
      this.permissionState = 'PENDING';
      console.log('[OrientationManager] Stopped.');
    }
  }

  public getPermissionState(): PermissionState {
    return this.permissionState;
  }

  private handleOrientation = (event: DeviceOrientationEvent) => {
    this.currentData.alpha = event.alpha;
    this.currentData.beta = event.beta;
    this.currentData.gamma = event.gamma;
  };

  private handleMotion = (event: DeviceMotionEvent) => {
    if (event.accelerationIncludingGravity) {
      this.currentData.x = event.accelerationIncludingGravity.x;
      this.currentData.y = event.accelerationIncludingGravity.y;
      this.currentData.z = event.accelerationIncludingGravity.z;
    }
  };

  public getOrientation(): OrientationData {
    return this.currentData;
  }
}
