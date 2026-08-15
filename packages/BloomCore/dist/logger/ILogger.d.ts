/**
 * ILogger.ts
 *
 * Defines the strict interface for the logging system.
 * By injecting this interface, we can swap console logging for
 * file logging or cloud telemetry without changing any logic.
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export interface ILogger {
    /**
     * Logs a debug message, usually for development only.
     */
    debug(tag: string, message: string, meta?: unknown): void;
    /**
     * Logs an informational message.
     */
    info(tag: string, message: string, meta?: unknown): void;
    /**
     * Logs a warning that does not crash the system.
     */
    warn(tag: string, message: string, meta?: unknown): void;
    /**
     * Logs a critical error.
     */
    error(tag: string, message: string, error?: Error | unknown): void;
}
//# sourceMappingURL=ILogger.d.ts.map