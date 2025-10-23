// public/js/utils/logger.ts
// Structured logging utility with correlation IDs

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
  correlationId?: string;
  meta?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Keep only last 1000 logs in memory
  private currentCorrelationId: string | null = null;

  // Set correlation ID for the current context
  setCorrelationId(correlationId: string): void {
    this.currentCorrelationId = correlationId;
  }

  // Get the current correlation ID
  getCorrelationId(): string | null {
    return this.currentCorrelationId;
  }

  // Generate a new correlation ID
  generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    correlationId?: string
  ): void {
    // Use the provided correlationId, the current one, or generate a new one
    const effectiveCorrelationId =
      correlationId ||
      this.currentCorrelationId ||
      this.generateCorrelationId();

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: effectiveCorrelationId,
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

  debug(
    message: string,
    meta?: Record<string, unknown>,
    correlationId?: string
  ): void {
    this.log(LogLevel.DEBUG, message, meta, correlationId);
  }

  info(
    message: string,
    meta?: Record<string, unknown>,
    correlationId?: string
  ): void {
    this.log(LogLevel.INFO, message, meta, correlationId);
  }

  warn(
    message: string,
    meta?: Record<string, unknown>,
    correlationId?: string
  ): void {
    this.log(LogLevel.WARN, message, meta, correlationId);
  }

  error(
    message: string,
    meta?: Record<string, unknown>,
    correlationId?: string
  ): void {
    this.log(LogLevel.ERROR, message, meta, correlationId);
  }

  private outputToConsole(entry: LogEntry): void {
    const correlationPart = entry.correlationId
      ? `[${entry.correlationId}] `
      : '';
    const formattedMessage = `[${
      entry.timestamp
    }] ${correlationPart}${entry.level.toUpperCase()}: ${entry.message}`;

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

  getLogs(level?: LogLevel, correlationId?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (correlationId) {
      filteredLogs = filteredLogs.filter(
        log => log.correlationId === correlationId
      );
    }

    return [...filteredLogs]; // Return a copy to prevent external modification
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Method to get logs as a formatted string (useful for debugging)
  getLogsAsString(maxEntries?: number, correlationId?: string): string {
    let logs = maxEntries ? this.logs.slice(-maxEntries) : this.logs;

    if (correlationId) {
      logs = logs.filter(log => log.correlationId === correlationId);
    }

    return logs
      .map(
        log =>
          `[${log.timestamp}] [${
            log.correlationId || 'N/A'
          }] ${log.level.toUpperCase()}: ${log.message}` +
          (log.meta ? ` ${JSON.stringify(log.meta)}` : '')
      )
      .join('\n');
  }

  // Method to trace an HTTP request from start to finish with correlation ID
  traceRequest<T>(operation: () => T, requestDescription: string): T {
    const correlationId = this.generateCorrelationId();
    this.setCorrelationId(correlationId);
    this.info(`Starting ${requestDescription}`, { correlationId });

    const startTime = Date.now();
    try {
      const result = operation();
      const duration = Date.now() - startTime;
      this.info(`Completed ${requestDescription}`, {
        correlationId,
        duration: `${duration}ms`,
        status: 'success',
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`Failed ${requestDescription}`, {
        correlationId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failure',
      });
      throw error;
    } finally {
      // Clear the correlation ID after the request is complete
      this.currentCorrelationId = null;
    }
  }
}

// Create a singleton logger instance
export const logger = new Logger();

// Export convenience methods
export const debug = (
  message: string,
  meta?: Record<string, unknown>,
  correlationId?: string
) => logger.debug(message, meta, correlationId);
export const info = (
  message: string,
  meta?: Record<string, unknown>,
  correlationId?: string
) => logger.info(message, meta, correlationId);
export const warn = (
  message: string,
  meta?: Record<string, unknown>,
  correlationId?: string
) => logger.warn(message, meta, correlationId);
export const error = (
  message: string,
  meta?: Record<string, unknown>,
  correlationId?: string
) => logger.error(message, meta, correlationId);

// Export correlation ID methods
export const setCorrelationId = (id: string) => logger.setCorrelationId(id);
export const getCorrelationId = () => logger.getCorrelationId();
export const generateCorrelationId = () => logger.generateCorrelationId();
export const traceRequest = <T>(
  operation: () => T,
  requestDescription: string
) => logger.traceRequest(operation, requestDescription);
