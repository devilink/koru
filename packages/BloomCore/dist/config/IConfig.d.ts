/**
 * IConfig.ts
 *
 * Interface for reading system configuration.
 * By abstracting this, we can eventually load configs from
 * a file, environment variables, or a database.
 */
export interface IConfig {
    /**
     * Get a string configuration value.
     */
    getString(key: string, defaultValue?: string): string;
    /**
     * Get a number configuration value.
     */
    getNumber(key: string, defaultValue?: number): number;
    /**
     * Get a boolean configuration value.
     */
    getBoolean(key: string, defaultValue?: boolean): boolean;
}
//# sourceMappingURL=IConfig.d.ts.map