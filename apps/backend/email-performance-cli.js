#!/usr/bin/env node

/**
 * Email Performance Monitoring CLI Tool
 * Usage: node email-performance-cli.js [command] [options]
 */

const { program } = require('commander');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function getPerformanceData(endpoint, timeRange = 60) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const url = `${backendUrl}/api/admin/email-performance/${endpoint}?timeRange=${timeRange}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data.data;
  } catch (error) {
    log(`❌ Error fetching performance data: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function showStats(timeRange) {
  log(`📊 Email Performance Statistics (Last ${timeRange} minutes)`, 'bold');
  log('=' .repeat(60), 'blue');
  
  const stats = await getPerformanceData('stats', timeRange);
  
  if (stats.totalEmails === 0) {
    log('📭 No email activity in the specified time range.', 'yellow');
    return;
  }
  
  const successRate = Math.round((stats.successfulEmails / stats.totalEmails) * 100);
  
  // Overall statistics
  log('\n📈 Overall Statistics:', 'cyan');
  log(`   Total Emails: ${stats.totalEmails}`);
  log(`   Success Rate: ${successRate}% (${stats.successfulEmails}/${stats.totalEmails})`, 
      successRate >= 95 ? 'green' : successRate >= 80 ? 'yellow' : 'red');
  log(`   Failed Emails: ${stats.failedEmails}`, stats.failedEmails > 0 ? 'red' : 'reset');
  log(`   Fallback Usage: ${stats.fallbackRate}%`, stats.fallbackRate > 20 ? 'yellow' : 'reset');
  
  // Performance metrics
  log('\n⏱️ Performance Metrics:', 'cyan');
  log(`   Average Render Time: ${stats.averageRenderTime}ms`, 
      stats.averageRenderTime > 500 ? 'yellow' : 'green');
  log(`   Average Send Time: ${stats.averageSendTime}ms`, 
      stats.averageSendTime > 5000 ? 'red' : stats.averageSendTime > 3000 ? 'yellow' : 'green');
  log(`   Average Total Time: ${stats.averageTotalTime}ms`, 
      stats.averageTotalTime > 5000 ? 'red' : stats.averageTotalTime > 3000 ? 'yellow' : 'green');
  
  // Error breakdown
  if (Object.keys(stats.errorTypes).length > 0) {
    log('\n❌ Error Breakdown:', 'cyan');
    Object.entries(stats.errorTypes).forEach(([type, count]) => {
      log(`   ${type}: ${count}`, 'red');
    });
  }
  
  // Slow emails
  if (stats.slowEmails.length > 0) {
    log('\n🐌 Recent Slow Emails:', 'cyan');
    stats.slowEmails.slice(-5).forEach(email => {
      log(`   ${email.email}: ${email.totalTime}ms`, 'yellow');
    });
  }
}

async function showReport(timeRange) {
  const reportData = await getPerformanceData('report', timeRange);
  console.log(reportData.report);
}

async function showStatus() {
  log('🔍 Real-time Email System Status', 'bold');
  log('=' .repeat(40), 'blue');
  
  const status = await getPerformanceData('status');
  
  const statusColor = status.status === 'healthy' ? 'green' : 
                     status.status === 'warning' ? 'yellow' : 'red';
  
  log(`\nStatus: ${status.status.toUpperCase()}`, statusColor);
  log(`Message: ${status.message}`, statusColor);
}

async function showHealth() {
  log('🏥 Email System Health Check', 'bold');
  log('=' .repeat(40), 'blue');
  
  const health = await getPerformanceData('health');
  
  const statusColor = health.status === 'healthy' ? 'green' : 
                     health.status === 'warning' ? 'yellow' : 'red';
  
  log(`\nOverall Status: ${health.status.toUpperCase()}`, statusColor);
  log(`Message: ${health.message}`, statusColor);
  
  log('\n📊 Recent Activity (Last 5 minutes):', 'cyan');
  log(`   Total Emails: ${health.recentActivity.totalEmails}`);
  log(`   Success Rate: ${health.recentActivity.successRate}%`, 
      health.recentActivity.successRate >= 95 ? 'green' : 'yellow');
  log(`   Average Delivery Time: ${health.recentActivity.averageDeliveryTime}ms`,
      health.recentActivity.averageDeliveryTime > 5000 ? 'red' : 'green');
  log(`   Fallback Rate: ${health.recentActivity.fallbackRate}%`,
      health.recentActivity.fallbackRate > 20 ? 'yellow' : 'green');
  
  log(`\nLast Updated: ${new Date(health.timestamp).toLocaleString()}`);
}

async function watchStatus() {
  log('👀 Watching Email System Status (Press Ctrl+C to stop)', 'bold');
  log('=' .repeat(50), 'blue');
  
  const interval = setInterval(async () => {
    try {
      process.stdout.write('\x1Bc'); // Clear screen
      await showHealth();
      log('\n⏰ Refreshing every 30 seconds...', 'cyan');
    } catch (error) {
      log(`❌ Error: ${error.message}`, 'red');
    }
  }, 30000);
  
  // Show initial status
  await showHealth();
  log('\n⏰ Refreshing every 30 seconds...', 'cyan');
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    log('\n👋 Monitoring stopped.', 'yellow');
    process.exit(0);
  });
}

// CLI Commands
program
  .name('email-performance-cli')
  .description('Email Performance Monitoring CLI Tool')
  .version('1.0.0');

program
  .command('stats')
  .description('Show email performance statistics')
  .option('-t, --time <minutes>', 'Time range in minutes', '60')
  .action(async (options) => {
    await showStats(parseInt(options.time));
  });

program
  .command('report')
  .description('Generate detailed performance report')
  .option('-t, --time <minutes>', 'Time range in minutes', '60')
  .action(async (options) => {
    await showReport(parseInt(options.time));
  });

program
  .command('status')
  .description('Show real-time system status')
  .action(showStatus);

program
  .command('health')
  .description('Show system health check')
  .action(showHealth);

program
  .command('watch')
  .description('Watch system status in real-time')
  .action(watchStatus);

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
