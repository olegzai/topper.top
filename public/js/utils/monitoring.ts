// public/js/utils/monitoring.ts
// Error and Performance Monitoring utilities

import { logger } from './logger';

export interface ErrorInfo {
  message: string;
  stack?: string | undefined;
  name?: string | undefined;
  timestamp: number;
  url?: string | undefined;
  userAgent?: string | undefined;
  meta?: Record<string, unknown> | undefined;
}

export interface PerformanceInfo {
  metricName: string;
  value: number;
  unit: string;
  timestamp: number;
  meta?: Record<string, unknown> | undefined;
}

class MonitoringService {
  private errors: ErrorInfo[] = [];
  private performanceMetrics: PerformanceInfo[] = [];
  private maxEntries: number = 1000;
  private remoteLoggingEnabled: boolean = false;
  private remoteLoggingUrl: string | undefined;

  constructor() {
    // Capture unhandled errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.addErrorDirectly({
        message: event.message,
        stack: event.error?.stack,
        name: event.error?.name,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener(
      'unhandledrejection',
      (event: PromiseRejectionEvent) => {
        this.addErrorDirectly({
          message: event.reason?.toString() || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          name: 'UnhandledRejection',
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      }
    );
  }

  // Add ErrorInfo object directly without conversion
  private addErrorDirectly(errorInfo: ErrorInfo): void {
    this.errors.push(errorInfo);

    // Keep only the last N errors to prevent memory issues
    if (this.errors.length > this.maxEntries) {
      this.errors = this.errors.slice(-this.maxEntries);
    }

    // Log to structured logger
    logger.error(errorInfo.message, {
      name: errorInfo.name,
      stack: errorInfo.stack,
      url: errorInfo.url,
      ...errorInfo.meta,
    });

    // Send to remote logging if enabled
    if (this.remoteLoggingEnabled && this.remoteLoggingUrl) {
      this.sendErrorToRemote(errorInfo);
    }
  }

  // Capture an error
  captureError(error: Error | string, meta?: Record<string, unknown>): void {
    let errorInfo: ErrorInfo;

    if (typeof error === 'string') {
      errorInfo = {
        message: error,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        meta: meta ?? undefined,
      };
    } else {
      errorInfo = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        meta: meta ?? undefined,
      };
    }

    this.errors.push(errorInfo);

    // Keep only the last N errors to prevent memory issues
    if (this.errors.length > this.maxEntries) {
      this.errors = this.errors.slice(-this.maxEntries);
    }

    // Log to structured logger
    logger.error(errorInfo.message, {
      name: errorInfo.name,
      stack: errorInfo.stack,
      url: errorInfo.url,
      ...meta,
    });

    // Send to remote logging if enabled
    if (this.remoteLoggingEnabled && this.remoteLoggingUrl) {
      this.sendErrorToRemote(errorInfo);
    }
  }

  // Capture performance metric
  capturePerformance(
    metricName: string,
    value: number,
    unit: string = 'ms',
    meta?: Record<string, unknown>
  ): void {
    const performanceInfo: PerformanceInfo = {
      metricName,
      value,
      unit,
      timestamp: Date.now(),
      meta: meta ?? undefined,
    };

    this.performanceMetrics.push(performanceInfo);

    // Keep only the last N metrics to prevent memory issues
    if (this.performanceMetrics.length > this.maxEntries) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxEntries);
    }

    // Log to structured logger
    logger.info(`Performance metric: ${metricName}`, {
      value,
      unit,
      ...meta,
    });

    // Send to remote monitoring if enabled
    if (this.remoteLoggingEnabled && this.remoteLoggingUrl) {
      this.sendPerformanceToRemote(performanceInfo);
    }
  }

  // Enable remote logging to a specified endpoint
  enableRemoteLogging(url: string): void {
    this.remoteLoggingEnabled = true;
    this.remoteLoggingUrl = url;
  }

  // Disable remote logging
  disableRemoteLogging(): void {
    this.remoteLoggingEnabled = false;
    this.remoteLoggingUrl = undefined;
  }

  // Send error to remote endpoint
  private async sendErrorToRemote(errorInfo: ErrorInfo): Promise<void> {
    if (!this.remoteLoggingUrl) return;

    try {
      await fetch(this.remoteLoggingUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'error',
          ...errorInfo,
        }),
      });
    } catch (sendError) {
      logger.error('Failed to send error to remote logging', {
        originalError: errorInfo.message,
        sendError: sendError instanceof Error ? sendError.message : 'Unknown',
      });
    }
  }

  // Send performance metric to remote endpoint
  private async sendPerformanceToRemote(
    performanceInfo: PerformanceInfo
  ): Promise<void> {
    if (!this.remoteLoggingUrl) return;

    try {
      await fetch(this.remoteLoggingUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance',
          ...performanceInfo,
        }),
      });
    } catch (sendError) {
      logger.error('Failed to send performance metric to remote logging', {
        metricName: performanceInfo.metricName,
        sendError: sendError instanceof Error ? sendError.message : 'Unknown',
      });
    }
  }

  // Get captured errors
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceInfo[] {
    return [...this.performanceMetrics];
  }

  // Clear all captured errors
  clearErrors(): void {
    this.errors = [];
  }

  // Clear all performance metrics
  clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }

  // Get error summary
  getErrorSummary(): { count: number; recent: ErrorInfo[] } {
    return {
      count: this.errors.length,
      recent: this.errors.slice(-10), // Last 10 errors
    };
  }

  // Get performance summary
  getPerformanceSummary(): {
    count: number;
    metrics: Record<string, PerformanceInfo[]>;
  } {
    const metrics: Record<string, PerformanceInfo[]> = {};

    this.performanceMetrics.forEach(metric => {
      if (!metrics[metric.metricName]) {
        metrics[metric.metricName] = [];
      }
      const metricArray = metrics[metric.metricName];
      if (metricArray) {
        metricArray.push(metric);
      }
    });

    return {
      count: this.performanceMetrics.length,
      metrics,
    };
  }
}

// Create a singleton monitoring service instance
export const monitoringService = new MonitoringService();

// Convenience functions
export const captureError = (
  error: Error | string,
  meta?: Record<string, unknown>
) => monitoringService.captureError(error, meta);

export const capturePerformance = (
  metricName: string,
  value: number,
  unit?: string,
  meta?: Record<string, unknown>
) => monitoringService.capturePerformance(metricName, value, unit, meta);

// Initialize performance monitoring for API calls
export const monitorApiCall = async <T>(
  operationName: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    monitoringService.capturePerformance(
      `${operationName}_duration`,
      duration,
      'ms',
      meta
    );
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    monitoringService.capturePerformance(
      `${operationName}_duration`,
      duration,
      'ms',
      meta
    );
    monitoringService.captureError(
      error instanceof Error ? error : new Error(String(error)),
      meta
    );
    throw error;
  }
};
