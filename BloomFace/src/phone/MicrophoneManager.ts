export type PermissionState = 'PENDING' | 'GRANTED' | 'DENIED' | 'UNAVAILABLE';

export class MicrophoneManager {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isListening: boolean = false;
  private permissionState: PermissionState = 'PENDING';
  
  // Voice activity detection threshold (0-255)
  private readonly VAD_THRESHOLD = 20;

  public async requestPermissionAndStart(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.permissionState = 'UNAVAILABLE';
        console.warn('[MicrophoneManager] Hardware unavailable.');
        return false;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.permissionState = 'GRANTED';
      
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Attempt to resume audio context if it starts suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      source.connect(this.analyser);
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.isListening = true;
      console.log('[MicrophoneManager] Microphone started successfully.');
      return true;
    } catch (err) {
      console.warn('[MicrophoneManager] Permission denied or hardware unavailable.', err);
      this.permissionState = 'DENIED';
      return false;
    }
  }

  public stop() {
    this.isListening = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(console.warn);
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.permissionState = 'PENDING';
    console.log('[MicrophoneManager] Microphone stopped.');
  }

  public getPermissionState(): PermissionState {
    return this.permissionState;
  }

  public getVolume(): number {
    if (!this.isListening || !this.analyser || !this.dataArray) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray as any);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    return sum / this.dataArray.length;
  }

  public isSpeaking(): boolean {
    return this.getVolume() > this.VAD_THRESHOLD;
  }
}
