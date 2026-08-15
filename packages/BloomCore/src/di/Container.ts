import { DIToken } from './Token';

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
  private static services = new Map<DIToken, any>();

  /**
   * Registers a service in the container.
   * @param token The strictly typed token identifying the service.
   * @param instance The singleton instance of the service.
   */
  public static register<T>(token: DIToken, instance: T): void {
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
  public static resolve<T>(token: DIToken): T {
    const instance = this.services.get(token);
    if (!instance) {
      throw new Error(`No service registered for token: ${token}`);
    }
    return instance as T;
  }

  /**
   * Clears all registered services. Useful for testing.
   */
  public static clear(): void {
    this.services.clear();
  }
}
