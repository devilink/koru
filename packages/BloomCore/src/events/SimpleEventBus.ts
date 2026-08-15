import { EventKey, EventMap } from './EventMap';
import { IEventBus } from './IEventBus';

type Handler<K extends EventKey> = (payload: EventMap[K]) => void;

/**
 * SimpleEventBus.ts
 * 
 * A lightweight, synchronous, in-memory implementation of IEventBus.
 * Designed to have zero external dependencies.
 */
export class SimpleEventBus implements IEventBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subscribers: Map<EventKey, Set<Handler<any>>> = new Map();

  public publish<K extends EventKey>(event: K, payload: EventMap[K]): void {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          // In a real implementation, this would route to BloomCore Logger
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public subscribe<K extends EventKey>(event: K, handler: (payload: EventMap[K]) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    // Type assertion needed because Set handles generic Handler<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.subscribers.get(event)!.add(handler as Handler<any>);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(event);
      if (handlers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handlers.delete(handler as Handler<any>);
        if (handlers.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  public clearSubscriptions(event?: EventKey): void {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }
}
