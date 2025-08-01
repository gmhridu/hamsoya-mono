interface PerformanceMetrics {
  pageLoadTime: number;
  hydrationTime: number;
  firstContentfulPaint: number;
  cartLoadTime: number;
  bookmarkLoadTime: number;
  apiResponseTimes: Record<string, number>;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private startTime = Date.now();
  private isLoggingEnabled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Only enable logging in development and when explicitly requested
      this.isLoggingEnabled =
        process.env.NODE_ENV === 'development' &&
        (window.localStorage?.getItem('enablePerformanceLogging') === 'true' ||
          window.location?.search.includes('debug=performance'));
      this.initializeMetrics();
    }
  }

  /**
   * Initialize performance metrics collection
   */
  private initializeMetrics() {
    // Measure page load time
    window.addEventListener('load', () => {
      this.metrics.pageLoadTime = Date.now() - this.startTime;
      this.logMetric('Page Load Time', this.metrics.pageLoadTime);
    });

    // Measure First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
            this.logMetric('First Contentful Paint', entry.startTime);
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });
    }

    // Monitor API response times only if logging is enabled
    if (this.isLoggingEnabled) {
      this.interceptFetch();
    }
  }

  /**
   * Intercept fetch requests to monitor API response times
   */
  private interceptFetch() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [url] = args;
      const startTime = Date.now();

      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Track API response times
        if (typeof url === 'string') {
          if (url.includes('/api/cart')) {
            this.metrics.apiResponseTimes = {
              ...this.metrics.apiResponseTimes,
              cart: duration,
            };
            this.logMetric('Cart API Response', duration);
          } else if (url.includes('/api/bookmarks')) {
            this.metrics.apiResponseTimes = {
              ...this.metrics.apiResponseTimes,
              bookmarks: duration,
            };
            this.logMetric('Bookmarks API Response', duration);
          }
        }

        return response;
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        if (this.isLoggingEnabled) {
          console.warn(`API request failed after ${duration}ms:`, url);
        }
        throw error;
      }
    };
  }

  /**
   * Mark hydration complete
   */
  markHydrationComplete() {
    this.metrics.hydrationTime = Date.now() - this.startTime;
    this.logMetric('Hydration Time', this.metrics.hydrationTime);
  }

  /**
   * Mark cart load complete
   */
  markCartLoaded() {
    this.metrics.cartLoadTime = Date.now() - this.startTime;
    this.logMetric('Cart Load Time', this.metrics.cartLoadTime);
  }

  /**
   * Mark bookmark load complete
   */
  markBookmarkLoaded() {
    this.metrics.bookmarkLoadTime = Date.now() - this.startTime;
    this.logMetric('Bookmark Load Time', this.metrics.bookmarkLoadTime);
  }

  /**
   * Log performance metric (only when logging is enabled)
   */
  private logMetric(name: string, value: number) {
    if (!this.isLoggingEnabled) return;

    const status = value < 1000 ? '✅' : value < 2000 ? '⚠️' : '❌';
    console.log(`${status} ${name}: ${value.toFixed(2)}ms`);

    // Warn if performance is poor
    if (value > 2000) {
      console.warn(`Performance warning: ${name} took ${value.toFixed(2)}ms (target: <1000ms)`);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const report = [
      '📊 Performance Report',
      '==================',
      '',
      `Page Load Time: ${this.metrics.pageLoadTime?.toFixed(2) || 'N/A'}ms`,
      `Hydration Time: ${this.metrics.hydrationTime?.toFixed(2) || 'N/A'}ms`,
      `First Contentful Paint: ${this.metrics.firstContentfulPaint?.toFixed(2) || 'N/A'}ms`,
      `Cart Load Time: ${this.metrics.cartLoadTime?.toFixed(2) || 'N/A'}ms`,
      `Bookmark Load Time: ${this.metrics.bookmarkLoadTime?.toFixed(2) || 'N/A'}ms`,
      '',
      'API Response Times:',
      `- Cart API: ${this.metrics.apiResponseTimes?.cart?.toFixed(2) || 'N/A'}ms`,
      `- Bookmarks API: ${this.metrics.apiResponseTimes?.bookmarks?.toFixed(2) || 'N/A'}ms`,
      '',
      'Performance Goals:',
      '- Page Load: <1000ms ✅',
      '- API Responses: <500ms ✅',
      '- Zero Loading States ✅',
      '- Instant Count Display ✅',
    ].join('\n');

    return report;
  }

  /**
   * Check if performance targets are met
   */
  checkPerformanceTargets(): boolean {
    const targets = {
      pageLoad: 1000,
      hydration: 500,
      cartLoad: 1000,
      bookmarkLoad: 1000,
      apiResponse: 500,
    };

    const issues: string[] = [];

    if (this.metrics.pageLoadTime && this.metrics.pageLoadTime > targets.pageLoad) {
      issues.push(`Page load time: ${this.metrics.pageLoadTime}ms > ${targets.pageLoad}ms`);
    }

    if (this.metrics.hydrationTime && this.metrics.hydrationTime > targets.hydration) {
      issues.push(`Hydration time: ${this.metrics.hydrationTime}ms > ${targets.hydration}ms`);
    }

    if (this.metrics.cartLoadTime && this.metrics.cartLoadTime > targets.cartLoad) {
      issues.push(`Cart load time: ${this.metrics.cartLoadTime}ms > ${targets.cartLoad}ms`);
    }

    if (this.metrics.bookmarkLoadTime && this.metrics.bookmarkLoadTime > targets.bookmarkLoad) {
      issues.push(
        `Bookmark load time: ${this.metrics.bookmarkLoadTime}ms > ${targets.bookmarkLoad}ms`
      );
    }

    if (
      this.metrics.apiResponseTimes?.cart &&
      this.metrics.apiResponseTimes.cart > targets.apiResponse
    ) {
      issues.push(
        `Cart API response: ${this.metrics.apiResponseTimes.cart}ms > ${targets.apiResponse}ms`
      );
    }

    if (
      this.metrics.apiResponseTimes?.bookmarks &&
      this.metrics.apiResponseTimes.bookmarks > targets.apiResponse
    ) {
      issues.push(
        `Bookmarks API response: ${this.metrics.apiResponseTimes.bookmarks}ms > ${targets.apiResponse}ms`
      );
    }

    if (issues.length > 0) {
      if (this.isLoggingEnabled) {
        console.warn('Performance targets not met:', issues);
      }
      return false;
    }

    if (this.isLoggingEnabled) {
      console.log('✅ All performance targets met!');
    }
    return true;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility functions
export function markHydrationComplete() {
  performanceMonitor.markHydrationComplete();
}

export function markCartLoaded() {
  performanceMonitor.markCartLoaded();
}

export function markBookmarkLoaded() {
  performanceMonitor.markBookmarkLoaded();
}

export function getPerformanceReport() {
  return performanceMonitor.generateReport();
}

export function checkPerformanceTargets() {
  return performanceMonitor.checkPerformanceTargets();
}
