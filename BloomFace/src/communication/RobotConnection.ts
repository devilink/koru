import { RobotMessage, isRobotMessage } from './Protocol';

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export class RobotConnection {
  private state: ConnectionState = 'DISCONNECTED';
  private ws: WebSocket | null = null;
  private url: string = '';
  
  private messageListeners: Set<(msg: RobotMessage) => void> = new Set();
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  
  // Heartbeat
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private lastPongTime: number = 0;
  private heartbeatTimeoutMs = 5000; // Force reconnect if no PONG for 5s
  private pingRateMs = 2000;
  
  // Reconnect
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  
  public connect(url: string) {
    if (this.state === 'CONNECTING' || this.state === 'CONNECTED') {
      console.warn('[RobotConnection] Already connecting/connected.');
      return;
    }

    this.url = url;
    this.shouldReconnect = true;
    this.initiateConnection();
  }

  private initiateConnection() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateState('CONNECTING');
    console.log(`[RobotConnection] Connecting to ESP32 at ${this.url}...`);

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('[RobotConnection] Connected successfully.');
        this.updateState('CONNECTED');
        this.lastPongTime = Date.now();
        this.startHeartbeat();
      };

      this.ws.onclose = () => {
        console.log('[RobotConnection] Disconnected.');
        this.updateState('DISCONNECTED');
        this.cleanup();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[RobotConnection] WebSocket error.', err);
        this.updateState('ERROR');
      };

      this.ws.onmessage = (event) => {
        this.handleRawMessage(event.data);
      };
    } catch (e) {
      console.error('[RobotConnection] Failed to create WebSocket', e);
      this.updateState('ERROR');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState('DISCONNECTED');
    console.log('[RobotConnection] Manually disconnected.');
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    
    console.log('[RobotConnection] Scheduling reconnect in 3 seconds...');
    this.reconnectTimeout = setTimeout(() => {
      this.initiateConnection();
    }, 3000);
  }

  private startHeartbeat() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    
    this.pingInterval = setInterval(() => {
      if (this.state !== 'CONNECTED') return;

      const now = Date.now();
      if (now - this.lastPongTime > this.heartbeatTimeoutMs) {
        console.warn('[RobotConnection] Heartbeat timeout! Disconnecting...');
        this.ws?.close();
        return;
      }

      this.send({ type: 'PING', timestamp: now });
    }, this.pingRateMs);
  }

  private handleRawMessage(data: any) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!isRobotMessage(parsed)) {
        console.warn('[RobotConnection] Received invalid message format:', parsed);
        return;
      }

      if (parsed.type === 'PONG') {
        this.lastPongTime = Date.now();
      }

      // Notify listeners
      this.messageListeners.forEach(listener => listener(parsed));
    } catch (e) {
      console.warn('[RobotConnection] Failed to parse message:', data);
    }
  }

  public send(msg: RobotMessage) {
    if (this.state !== 'CONNECTED' || !this.ws) {
      console.warn('[RobotConnection] Cannot send data, not connected.');
      return;
    }
    try {
      this.ws.send(JSON.stringify(msg));
    } catch (e) {
      console.error('[RobotConnection] Send failed:', e);
    }
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public onMessage(callback: (msg: RobotMessage) => void) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback); // Returns unsubscribe function
  }

  public onStateChange(callback: (state: ConnectionState) => void) {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  private updateState(newState: ConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach(cb => cb(newState));
    }
  }
}
