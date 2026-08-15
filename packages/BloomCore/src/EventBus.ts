import { EventEmitter } from 'events';
import { BloomEvent, EventType, EventHandler } from './types';

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    // Increase limit for a large system
    this.emitter.setMaxListeners(50);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish<T>(type: EventType, payload: T, source: string = 'unknown'): void {
    const event: BloomEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source
    };
    // Publish to specific type channel
    this.emitter.emit(type, event);
    // Publish to wildcard channel for loggers
    this.emitter.emit('*', event);
  }

  public subscribe(type: EventType | '*', handler: EventHandler): () => void {
    this.emitter.on(type, handler);
    // Return an unsubscribe function
    return () => {
      this.emitter.off(type, handler);
    };
  }
}

// Export a singleton instance for convenience
export const bloomBus = EventBus.getInstance();
