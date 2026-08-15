/**
 * Token.ts
 *
 * Defines strict string tokens used to resolve dependencies from the DI Container.
 * This prevents typos and ensures type safety when requesting a service.
 */
export declare const DI_TOKENS: {
    readonly EventBus: "EventBus";
    readonly Logger: "Logger";
    readonly ConfigManager: "ConfigManager";
};
export type DIToken = typeof DI_TOKENS[keyof typeof DI_TOKENS];
//# sourceMappingURL=Token.d.ts.map