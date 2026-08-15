/**
 * ILogger.ts
 *
 * Defines the strict interface for the logging system.
 * By injecting this interface, we can swap console logging for
 * file logging or cloud telemetry without changing any logic.
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
//# sourceMappingURL=ILogger.js.map