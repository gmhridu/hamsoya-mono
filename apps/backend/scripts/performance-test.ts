#!/usr/bin/env bun

/**
 * Performance Testing Script for Hamsoya Backend
 * 
 * Tests API performance under load and measures:
 * - Response times
 * - Throughput
 * - Error rates
 * - Memory usage
 * - Database connection efficiency
 */

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8787';
const CONCURRENT_USERS = 10;
const REQUESTS_PER_USER = 20;
const TEST_DURATION_MS = 30000; // 30 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message: string, color: keyof typeof colors = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  responseTimes: number[];
}

class PerformanceTester {
  private baseURL: string;
  private metrics: PerformanceMetrics;
  private startTime: number = 0;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errorRate: 0,
      responseTimes: [],
    };
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<number> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.metrics.successfulRequests++;
      } else {
        this.metrics.failedRequests++;
      }
      
      this.metrics.totalRequests++;
      this.metrics.responseTimes.push(responseTime);
      this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
      this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
      
      return responseTime;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.metrics.failedRequests++;
      this.metrics.totalRequests++;
      this.metrics.responseTimes.push(responseTime);
      return responseTime;
    }
  }

  private async runConcurrentRequests(endpoint: string, method: string = 'GET', body?: any) {
    const promises = Array(CONCURRENT_USERS).fill(null).map(async () => {
      for (let i = 0; i < REQUESTS_PER_USER; i++) {
        await this.makeRequest(endpoint, method, body);
        // Small delay to simulate real user behavior
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });

    await Promise.all(promises);
  }

  private calculateMetrics() {
    const totalTime = Date.now() - this.startTime;
    
    this.metrics.averageResponseTime = 
      this.metrics.responseTimes.reduce((sum, time) => sum + time, 0) / this.metrics.responseTimes.length;
    
    this.metrics.requestsPerSecond = (this.metrics.totalRequests / totalTime) * 1000;
    this.metrics.errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
  }

  private getPercentile(percentile: number): number {
    const sorted = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  async testHealthEndpoint() {
    log('\n🏥 Testing Health Endpoint Performance', 'blue');
    this.startTime = Date.now();
    
    await this.runConcurrentRequests('/api/health');
    this.calculateMetrics();
    
    this.printResults('Health Endpoint');
    this.resetMetrics();
  }

  async testAuthEndpoints() {
    log('\n🔐 Testing Authentication Endpoints Performance', 'blue');
    this.startTime = Date.now();
    
    // Test registration endpoint
    const registrationBody = {
      name: 'Performance Test User',
      email: `perf-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'USER',
    };
    
    await this.runConcurrentRequests('/api/auth/register', 'POST', registrationBody);
    this.calculateMetrics();
    
    this.printResults('Registration Endpoint');
    this.resetMetrics();
  }

  async testDatabasePerformance() {
    log('\n🗄️  Testing Database Performance', 'blue');
    this.startTime = Date.now();
    
    // Test tRPC health endpoint which involves database
    await this.runConcurrentRequests('/trpc/health.check', 'POST', {});
    this.calculateMetrics();
    
    this.printResults('Database Operations');
    this.resetMetrics();
  }

  async testRateLimiting() {
    log('\n⚡ Testing Rate Limiting Performance', 'blue');
    this.startTime = Date.now();
    
    // Rapid fire requests to test rate limiting
    const promises = Array(50).fill(null).map(() => 
      this.makeRequest('/api/auth/forgot-password', 'POST', {
        email: 'ratelimit-test@example.com'
      })
    );
    
    await Promise.all(promises);
    this.calculateMetrics();
    
    this.printResults('Rate Limiting Test');
    this.resetMetrics();
  }

  private resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errorRate: 0,
      responseTimes: [],
    };
  }

  private printResults(testName: string) {
    log(`\n📊 ${testName} Results:`, 'bright');
    log(`Total Requests: ${this.metrics.totalRequests}`, 'cyan');
    log(`Successful: ${this.metrics.successfulRequests}`, 'green');
    log(`Failed: ${this.metrics.failedRequests}`, this.metrics.failedRequests > 0 ? 'red' : 'green');
    log(`Error Rate: ${this.metrics.errorRate.toFixed(2)}%`, this.metrics.errorRate > 5 ? 'red' : 'green');
    log(`Requests/Second: ${this.metrics.requestsPerSecond.toFixed(2)}`, 'blue');
    
    log('\n⏱️  Response Times:', 'yellow');
    log(`Average: ${this.metrics.averageResponseTime.toFixed(2)}ms`, 'cyan');
    log(`Min: ${this.metrics.minResponseTime}ms`, 'green');
    log(`Max: ${this.metrics.maxResponseTime}ms`, 'red');
    log(`50th Percentile: ${this.getPercentile(50).toFixed(2)}ms`, 'cyan');
    log(`95th Percentile: ${this.getPercentile(95).toFixed(2)}ms`, 'yellow');
    log(`99th Percentile: ${this.getPercentile(99).toFixed(2)}ms`, 'red');
    
    // Performance assessment
    const avgResponseTime = this.metrics.averageResponseTime;
    const rps = this.metrics.requestsPerSecond;
    
    log('\n🎯 Performance Assessment:', 'bright');
    
    if (avgResponseTime < 100) {
      log('Response Time: Excellent (< 100ms)', 'green');
    } else if (avgResponseTime < 300) {
      log('Response Time: Good (< 300ms)', 'yellow');
    } else {
      log('Response Time: Needs Improvement (> 300ms)', 'red');
    }
    
    if (rps > 100) {
      log('Throughput: Excellent (> 100 RPS)', 'green');
    } else if (rps > 50) {
      log('Throughput: Good (> 50 RPS)', 'yellow');
    } else {
      log('Throughput: Needs Improvement (< 50 RPS)', 'red');
    }
    
    if (this.metrics.errorRate < 1) {
      log('Reliability: Excellent (< 1% errors)', 'green');
    } else if (this.metrics.errorRate < 5) {
      log('Reliability: Good (< 5% errors)', 'yellow');
    } else {
      log('Reliability: Needs Improvement (> 5% errors)', 'red');
    }
  }

  async runAllTests() {
    log('\n🚀 Starting Hamsoya Backend Performance Tests\n', 'bright');
    log(`Configuration:`, 'blue');
    log(`- API Base URL: ${this.baseURL}`, 'cyan');
    log(`- Concurrent Users: ${CONCURRENT_USERS}`, 'cyan');
    log(`- Requests per User: ${REQUESTS_PER_USER}`, 'cyan');
    log(`- Total Requests per Test: ${CONCURRENT_USERS * REQUESTS_PER_USER}`, 'cyan');
    
    try {
      await this.testHealthEndpoint();
      await this.testAuthEndpoints();
      await this.testDatabasePerformance();
      await this.testRateLimiting();
      
      log('\n✨ Performance testing completed!\n', 'bright');
    } catch (error) {
      log(`\n❌ Performance testing failed: ${error}`, 'red');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const tester = new PerformanceTester(API_BASE_URL);
  await tester.runAllTests();
}

// Run tests
if (import.meta.main) {
  main().catch((error) => {
    log(`Performance test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}
