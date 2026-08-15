import { EventType, EventHandler } from './types';
export declare class EventBus {
    private static instance;
    private emitter;
    private constructor();
    static getInstance(): EventBus;
    publish<T>(type: EventType, payload: T, source?: string): void;
    subscribe(type: EventType | '*', handler: EventHandler): () => void;
}
export declare const bloomBus: EventBus;
//# sourceMappingURL=EventBus.d.ts.map