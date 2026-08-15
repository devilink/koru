import { ILogger, LogLevel } from './ILogger';

/**
 * ConsoleLogger.ts
 * 
 * Default implementation of ILogger that outputs to stdout/stderr.
 */
export class ConsoleLogger implements ILogger {
  constructor(private minLevel: LogLevel = LogLevel.DEBUG) {}

  private formatMessage(level: string, tag: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${tag}] ${message}`;
  }

  public debug(tag: string, message: string, meta?: unknown): void {
    if (this.minLevel <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', tag, message), meta ? meta : '');
    }
  }

  public info(tag: string, message: string, meta?: unknown): void {
    if (this.minLevel <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', tag, message), meta ? meta : '');
    }
  }

  public warn(tag: string, message: string, meta?: unknown): void {
    if (this.minLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', tag, message), meta ? meta : '');
    }
  }

  public error(tag: string, message: string, error?: Error | unknown): void {
    if (this.minLevel <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', tag, message), error ? error : '');
    }
  }
}
