import { DIToken } from './Token';
/**
 * Container.ts
 *
 * A lightweight Service Locator / DI Container.
 * BloomOS uses this to register services on startup.
 * Other packages can resolve services from here if constructor injection
 * is not possible, but constructor injection is preferred.
 */
export declare class Container {
    private static services;
    /**
     * Registers a service in the container.
     * @param token The strictly typed token identifying the service.
     * @param instance The singleton instance of the service.
     */
    static register<T>(token: DIToken, instance: T): void;
    /**
     * Resolves a service from the container.
     * @param token The strictly typed token to resolve.
     * @returns The registered instance.
     * @throws Error if the service is not found.
     */
    static resolve<T>(token: DIToken): T;
    /**
     * Clears all registered services. Useful for testing.
     */
    static clear(): void;
}
//# sourceMappingURL=Container.d.ts.map