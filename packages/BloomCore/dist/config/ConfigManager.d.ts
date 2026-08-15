import { IConfig } from './IConfig';
import { ILogger } from '../logger/ILogger';
/**
 * ConfigManager.ts
 *
 * Default implementation of IConfig reading from process.env.
 * Demonstrates constructor injection of ILogger.
 */
export declare class ConfigManager implements IConfig {
    private logger;
    constructor(logger: ILogger);
    getString(key: string, defaultValue?: string): string;
    getNumber(key: string, defaultValue?: number): number;
    getBoolean(key: string, defaultValue?: boolean): boolean;
}
//# sourceMappingURL=ConfigManager.d.ts.map