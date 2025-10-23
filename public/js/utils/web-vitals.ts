// public/js/utils/web-vitals.ts
// Web Vitals monitoring utility

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface WebVitalMetrics {
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  ttfb: number | null; // Time to First Byte
}

class WebVitalsMonitor {
  private metrics: WebVitalMetrics = {
    cls: null,
    fid: null,
    fcp: null,
    lcp: null,
    ttfb: null,
  };

  private isMonitoring: boolean = false;

  /**
   * Initialize Web Vitals monitoring
   */
  init(): void {
    if (this.isMonitoring) {
      console.warn('Web Vitals monitoring is already active');
      return;
    }

    console.log('[WebVitals] Starting Web Vitals monitoring');

    // Measure Core Web Vitals
    onCLS(this.updateMetric.bind(this, 'cls'));
    onINP(this.updateMetric.bind(this, 'fid')); // Using INP instead of FID
    onFCP(this.updateMetric.bind(this, 'fcp'));
    onLCP(this.updateMetric.bind(this, 'lcp'));
    onTTFB(this.updateMetric.bind(this, 'ttfb'));

    this.isMonitoring = true;
  }

  /**
   * Update a specific metric value
   */
  private updateMetric(
    metricName: keyof WebVitalMetrics,
    metric: { value: number }
  ): void {
    this.metrics[metricName] = metric.value;
    console.log(
      `[WebVitals] ${metricName.toUpperCase()} updated:`,
      metric.value
    );

    // Optionally send to analytics or logging service
    this.sendToAnalytics(metricName, metric.value);
  }

  /**
   * Send metrics to analytics service (placeholder)
   */
  private sendToAnalytics(metricName: string, value: number): void {
    // In a real implementation, you would send this to your analytics service
    // For example: Google Analytics, DataDog, custom endpoint, etc.

    // For now, we'll just log the metrics using our structured logger
    // Using dynamic import to avoid circular dependency
    import('./logger')
      .then(loggerModule => {
        loggerModule.info(`Web Vital metric: ${metricName.toUpperCase()}`, {
          [metricName]: value,
          timestamp: new Date().toISOString(),
        });
      })
      .catch(err => {
        console.warn('Could not import logger module:', err);
        // Fallback to console if logger is not available
        console.log(`[WebVitals] ${metricName.toUpperCase()}:`, value);
      });

    // For debugging in browser console
    if (typeof window !== 'undefined') {
      // Store metrics in window for debugging
      (window as unknown as { __webVitals?: WebVitalMetrics }).__webVitals = {
        ...this.metrics,
      };
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebVitalMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if metrics meet Core Web Vitals thresholds
   */
  getPerformanceStatus(): {
    cls: 'good' | 'needs-improvement' | 'poor';
    fid: 'good' | 'needs-improvement' | 'poor';
    lcp: 'good' | 'needs-improvement' | 'poor';
  } {
    // Core Web Vitals thresholds
    // CLS: < 0.1 is good, 0.1-0.25 needs improvement, > 0.25 poor
    // FID: < 100ms is good, 100-300 needs improvement, > 300 poor
    // LCP: < 2500ms is good, 2500-4000 needs improvement, > 4000 poor
    return {
      cls:
        this.metrics.cls === null
          ? 'needs-improvement'
          : this.metrics.cls < 0.1
          ? 'good'
          : this.metrics.cls <= 0.25
          ? 'needs-improvement'
          : 'poor',
      fid:
        this.metrics.fid === null
          ? 'needs-improvement'
          : this.metrics.fid < 100
          ? 'good'
          : this.metrics.fid <= 300
          ? 'needs-improvement'
          : 'poor',
      lcp:
        this.metrics.lcp === null
          ? 'needs-improvement'
          : this.metrics.lcp < 2500
          ? 'good'
          : this.metrics.lcp <= 4000
          ? 'needs-improvement'
          : 'poor',
    };
  }

  /**
   * Log performance status to console
   */
  logPerformanceStatus(): void {
    const status = this.getPerformanceStatus();
    const metrics = this.getMetrics();

    console.table({
      Metric: ['CLS', 'FID', 'LCP'],
      Value: [
        metrics.cls !== null ? `${metrics.cls.toFixed(3)}s` : 'N/A',
        metrics.fid !== null ? `${metrics.fid.toFixed(0)}ms` : 'N/A',
        metrics.lcp !== null ? `${metrics.lcp.toFixed(0)}ms` : 'N/A',
      ],
      Status: [status.cls, status.fid, status.lcp],
    });
  }
}

// Create and export a singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();

// Export individual functions for direct access if needed
export { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
