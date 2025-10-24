// public/js/utils/performance.ts
// Performance monitoring utilities

export interface PerformanceMetric {
  name: string;
  duration: number; // in milliseconds
  timestamp: number;
  meta?: Record<string, unknown> | undefined;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000; // Keep only last 1000 metrics in memory

  // Measure execution time of a function
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    meta?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    const startTimestamp = Date.now();

    try {
      const result = await fn();

      const duration = performance.now() - startTime;
      const metric: PerformanceMetric = {
        name,
        duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
        timestamp: startTimestamp,
        meta: meta ?? undefined,
      };

      this.metrics.push(metric);

      // Keep only the last N metrics to prevent memory issues
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const metric: PerformanceMetric = {
        name: `${name}_error`,
        duration: Math.round(duration * 100) / 100,
        timestamp: startTimestamp,
        meta: {
          ...meta,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };

      this.metrics.push(metric);

      // Keep only the last N metrics to prevent memory issues
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }

      throw error;
    }
  }

  // Get performance metrics for a specific operation
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(
        metric => metric.name === name || metric.name.startsWith(name)
      );
    }
    return [...this.metrics]; // Return a copy to prevent external modification
  }

  // Get average duration for a specific operation
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const totalDuration = metrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    return totalDuration / metrics.length;
  }

  // Get median duration for a specific operation
  getMedianDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const sortedDurations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const mid = Math.floor(sortedDurations.length / 2);

    if (sortedDurations.length % 2 !== 0) {
      return sortedDurations[mid] ?? 0;
    } else {
      const left = sortedDurations[mid - 1];
      const right = sortedDurations[mid];
      return ((left ?? 0) + (right ?? 0)) / 2;
    }
  }

  // Get the slowest execution for a specific operation
  getSlowestDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const durations = metrics.map(m => m.duration);
    return durations.length > 0 ? Math.max(...durations) : 0;
  }

  // Get the fastest execution for a specific operation
  getFastestDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const durations = metrics.map(m => m.duration);
    return durations.length > 0 ? Math.min(...durations) : 0;
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Get performance summary for a specific operation
  getSummary(name: string): {
    count: number;
    average: number;
    median: number;
    fastest: number;
    slowest: number;
    percentile95: number;
  } {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) {
      return {
        count: 0,
        average: 0,
        median: 0,
        fastest: 0,
        slowest: 0,
        percentile95: 0,
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    const average = this.getAverageDuration(name);
    const median = this.getMedianDuration(name);
    const fastest = this.getFastestDuration(name);
    const slowest = this.getSlowestDuration(name);

    // Calculate 95th percentile
    const percentile95Index = Math.floor(0.95 * (durations.length - 1));
    const percentile95 = durations[percentile95Index] ?? 0;

    return {
      count,
      average,
      median,
      fastest,
      slowest,
      percentile95,
    };
  }

  // Log performance metrics to console (for debugging)
  logMetrics(name?: string): void {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) {
      console.log(`No performance metrics found${name ? ` for ${name}` : ''}`);
      return;
    }

    console.group(`Performance Metrics${name ? ` for ${name}` : ''}`);
    metrics.forEach(metric => {
      console.log(`${metric.name}: ${metric.duration}ms`, metric.meta || '');
    });
    console.groupEnd();
  }
}

// Create a singleton performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience function for measuring API requests
export const measureApiCall = async <T>(
  endpoint: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>
): Promise<T> => {
  return performanceMonitor.measure(`api_${endpoint}`, fn, meta);
};
