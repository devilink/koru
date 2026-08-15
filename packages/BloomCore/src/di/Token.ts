/**
 * Token.ts
 * 
 * Defines strict string tokens used to resolve dependencies from the DI Container.
 * This prevents typos and ensures type safety when requesting a service.
 */
export const DI_TOKENS = {
  EventBus: 'EventBus',
  Logger: 'Logger',
  ConfigManager: 'ConfigManager',
} as const;

export type DIToken = typeof DI_TOKENS[keyof typeof DI_TOKENS];
