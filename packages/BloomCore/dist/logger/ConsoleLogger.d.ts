import { ILogger, LogLevel } from './ILogger';
/**
 * ConsoleLogger.ts
 *
 * Default implementation of ILogger that outputs to stdout/stderr.
 */
export declare class ConsoleLogger implements ILogger {
    private minLevel;
    constructor(minLevel?: LogLevel);
    private formatMessage;
    debug(tag: string, message: string, meta?: unknown): void;
    info(tag: string, message: string, meta?: unknown): void;
    warn(tag: string, message: string, meta?: unknown): void;
    error(tag: string, message: string, error?: Error | unknown): void;
}
//# sourceMappingURL=ConsoleLogger.d.ts.map