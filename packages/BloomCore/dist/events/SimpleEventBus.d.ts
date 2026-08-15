import { EventKey, EventMap } from './EventMap';
import { IEventBus } from './IEventBus';
/**
 * SimpleEventBus.ts
 *
 * A lightweight, synchronous, in-memory implementation of IEventBus.
 * Designed to have zero external dependencies.
 */
export declare class SimpleEventBus implements IEventBus {
    private subscribers;
    publish<K extends EventKey>(event: K, payload: EventMap[K]): void;
    subscribe<K extends EventKey>(event: K, handler: (payload: EventMap[K]) => void): () => void;
    clearSubscriptions(event?: EventKey): void;
}
//# sourceMappingURL=SimpleEventBus.d.ts.map