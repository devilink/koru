import { EventKey, EventMap } from './EventMap';
/**
 * IEventBus.ts
 *
 * The strict interface for the Event Bus.
 * By depending on this interface rather than a concrete implementation,
 * BloomOS can swap out the underlying event mechanism (e.g., to Redis or MQTT)
 * without affecting any package.
 */
export interface IEventBus {
    /**
     * Publishes an event to all subscribers.
     * @param event The event key (must exist in EventMap)
     * @param payload The strongly typed payload for the event
     */
    publish<K extends EventKey>(event: K, payload: EventMap[K]): void;
    /**
     * Subscribes to an event.
     * @param event The event key to listen to
     * @param handler The callback function that receives the typed payload
     * @returns A function to unsubscribe
     */
    subscribe<K extends EventKey>(event: K, handler: (payload: EventMap[K]) => void): () => void;
    /**
     * Clears all subscriptions for a specific event or all events.
     * Useful for testing and system resets.
     */
    clearSubscriptions(event?: EventKey): void;
}
//# sourceMappingURL=IEventBus.d.ts.map