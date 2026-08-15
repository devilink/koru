/**
 * Container.ts
 *
 * A lightweight Service Locator / DI Container.
 * BloomOS uses this to register services on startup.
 * Other packages can resolve services from here if constructor injection
 * is not possible, but constructor injection is preferred.
 */
export class Container {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static services = new Map();
    /**
     * Registers a service in the container.
     * @param token The strictly typed token identifying the service.
     * @param instance The singleton instance of the service.
     */
    static register(token, instance) {
        if (this.services.has(token)) {
            throw new Error(`Service already registered for token: ${token}`);
        }
        this.services.set(token, instance);
    }
    /**
     * Resolves a service from the container.
     * @param token The strictly typed token to resolve.
     * @returns The registered instance.
     * @throws Error if the service is not found.
     */
    static resolve(token) {
        const instance = this.services.get(token);
        if (!instance) {
            throw new Error(`No service registered for token: ${token}`);
        }
        return instance;
    }
    /**
     * Clears all registered services. Useful for testing.
     */
    static clear() {
        this.services.clear();
    }
}
//# sourceMappingURL=Container.js.map