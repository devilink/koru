export type PermissionState = 'PENDING' | 'GRANTED' | 'DENIED' | 'UNAVAILABLE';

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private permissionState: PermissionState = 'PENDING';
  private debugContainer: HTMLElement | null = null;

  public async requestPermissionAndStart(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.permissionState = 'UNAVAILABLE';
        console.warn('[CameraManager] Hardware unavailable.');
        return false;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      this.permissionState = 'GRANTED';
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;
      
      this.videoElement.play().catch(e => console.warn('[CameraManager] Video play blocked', e));
      
      console.log('[CameraManager] Camera started successfully.');
      return true;
    } catch (err) {
      console.warn('[CameraManager] Permission denied or error.', err);
      this.permissionState = 'DENIED';
      return false;
    }
  }

  public stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      if (this.videoElement.parentElement) {
        this.videoElement.parentElement.removeChild(this.videoElement);
      }
      this.videoElement = null;
    }
    this.permissionState = 'PENDING';
    console.log('[CameraManager] Camera stopped.');
  }

  public getPermissionState(): PermissionState {
    return this.permissionState;
  }

  public isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public toggleDebugPreview(container: HTMLElement | null) {
    if (this.debugContainer && this.videoElement && this.videoElement.parentElement === this.debugContainer) {
      this.debugContainer.removeChild(this.videoElement);
    }
    
    this.debugContainer = container;
    
    if (this.debugContainer && this.videoElement) {
      this.videoElement.style.width = '100%';
      this.videoElement.style.height = '100%';
      this.videoElement.style.objectFit = 'cover';
      this.debugContainer.appendChild(this.videoElement);
    }
  }
}
