/**
 * SimpleEventBus.ts
 *
 * A lightweight, synchronous, in-memory implementation of IEventBus.
 * Designed to have zero external dependencies.
 */
export class SimpleEventBus {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribers = new Map();
    publish(event, payload) {
        const handlers = this.subscribers.get(event);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(payload);
                }
                catch (error) {
                    // In a real implementation, this would route to BloomCore Logger
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
    subscribe(event, handler) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        // Type assertion needed because Set handles generic Handler<any>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.subscribers.get(event).add(handler);
        // Return unsubscribe function
        return () => {
            const handlers = this.subscribers.get(event);
            if (handlers) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this.subscribers.delete(event);
                }
            }
        };
    }
    clearSubscriptions(event) {
        if (event) {
            this.subscribers.delete(event);
        }
        else {
            this.subscribers.clear();
        }
    }
}
//# sourceMappingURL=SimpleEventBus.js.map