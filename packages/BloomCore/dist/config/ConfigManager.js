/**
 * ConfigManager.ts
 *
 * Default implementation of IConfig reading from process.env.
 * Demonstrates constructor injection of ILogger.
 */
export class ConfigManager {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    getString(key, defaultValue) {
        const value = process.env[key];
        if (value !== undefined) {
            return value;
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        this.logger.warn('ConfigManager', `Missing string config for key: ${key}, throwing error.`);
        throw new Error(`Missing required configuration key: ${key}`);
    }
    getNumber(key, defaultValue) {
        const value = process.env[key];
        if (value !== undefined) {
            const parsed = parseFloat(value);
            if (isNaN(parsed)) {
                this.logger.error('ConfigManager', `Invalid number config for key: ${key}. Value: ${value}`);
                throw new Error(`Invalid number configuration for key: ${key}`);
            }
            return parsed;
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        this.logger.warn('ConfigManager', `Missing number config for key: ${key}, throwing error.`);
        throw new Error(`Missing required configuration key: ${key}`);
    }
    getBoolean(key, defaultValue) {
        const value = process.env[key];
        if (value !== undefined) {
            return value.toLowerCase() === 'true' || value === '1';
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        this.logger.warn('ConfigManager', `Missing boolean config for key: ${key}, throwing error.`);
        throw new Error(`Missing required configuration key: ${key}`);
    }
}
//# sourceMappingURL=ConfigManager.js.map