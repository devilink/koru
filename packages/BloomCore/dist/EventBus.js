import { EventEmitter } from 'events';
export class EventBus {
    static instance;
    emitter;
    constructor() {
        this.emitter = new EventEmitter();
        // Increase limit for a large system
        this.emitter.setMaxListeners(50);
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    publish(type, payload, source = 'unknown') {
        const event = {
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
    subscribe(type, handler) {
        this.emitter.on(type, handler);
        // Return an unsubscribe function
        return () => {
            this.emitter.off(type, handler);
        };
    }
}
// Export a singleton instance for convenience
export const bloomBus = EventBus.getInstance();
//# sourceMappingURL=EventBus.js.map