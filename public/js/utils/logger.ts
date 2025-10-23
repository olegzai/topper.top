// public/js/utils/logger.ts
// Structured logging utility

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Keep only last 1000 logs in memory

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta !== undefined ? { meta } : {}),
    };

    this.logs.push(logEntry);

    // Keep only the last N logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console
    this.outputToConsole(logEntry);

    // You could add additional logging transports here (like sending to a server)
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  private outputToConsole(entry: LogEntry): void {
    const formattedMessage = `[${
      entry.timestamp
    }] ${entry.level.toUpperCase()}: ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.meta || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.meta || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.meta || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.meta || '');
        break;
      default:
        console.log(formattedMessage, entry.meta || '');
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs]; // Return a copy to prevent external modification
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Method to get logs as a formatted string (useful for debugging)
  getLogsAsString(maxEntries?: number): string {
    const logs = maxEntries ? this.logs.slice(-maxEntries) : this.logs;
    return logs
      .map(
        log =>
          `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}` +
          (log.meta ? ` ${JSON.stringify(log.meta)}` : '')
      )
      .join('\n');
  }
}

// Create a singleton logger instance
export const logger = new Logger();

// Export convenience methods
export const debug = (message: string, meta?: Record<string, unknown>) =>
  logger.debug(message, meta);
export const info = (message: string, meta?: Record<string, unknown>) =>
  logger.info(message, meta);
export const warn = (message: string, meta?: Record<string, unknown>) =>
  logger.warn(message, meta);
export const error = (message: string, meta?: Record<string, unknown>) =>
  logger.error(message, meta);
