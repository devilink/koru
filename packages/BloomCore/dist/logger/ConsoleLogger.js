import { LogLevel } from './ILogger';
/**
 * ConsoleLogger.ts
 *
 * Default implementation of ILogger that outputs to stdout/stderr.
 */
export class ConsoleLogger {
    minLevel;
    constructor(minLevel = LogLevel.DEBUG) {
        this.minLevel = minLevel;
    }
    formatMessage(level, tag, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] [${tag}] ${message}`;
    }
    debug(tag, message, meta) {
        if (this.minLevel <= LogLevel.DEBUG) {
            console.debug(this.formatMessage('DEBUG', tag, message), meta ? meta : '');
        }
    }
    info(tag, message, meta) {
        if (this.minLevel <= LogLevel.INFO) {
            console.info(this.formatMessage('INFO', tag, message), meta ? meta : '');
        }
    }
    warn(tag, message, meta) {
        if (this.minLevel <= LogLevel.WARN) {
            console.warn(this.formatMessage('WARN', tag, message), meta ? meta : '');
        }
    }
    error(tag, message, error) {
        if (this.minLevel <= LogLevel.ERROR) {
            console.error(this.formatMessage('ERROR', tag, message), error ? error : '');
        }
    }
}
//# sourceMappingURL=ConsoleLogger.js.map