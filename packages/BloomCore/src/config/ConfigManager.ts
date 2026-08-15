import { IConfig } from './IConfig';
import { ILogger } from '../logger/ILogger';

/**
 * ConfigManager.ts
 * 
 * Default implementation of IConfig reading from process.env.
 * Demonstrates constructor injection of ILogger.
 */
export class ConfigManager implements IConfig {
  constructor(private logger: ILogger) {}

  public getString(key: string, defaultValue?: string): string {
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

  public getNumber(key: string, defaultValue?: number): number {
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

  public getBoolean(key: string, defaultValue?: boolean): boolean {
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
