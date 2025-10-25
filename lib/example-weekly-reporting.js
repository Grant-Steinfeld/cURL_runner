#!/usr/bin/env node

/**
 * Example: Weekly Data Gap Analysis and Reporting
 * 
 * This example demonstrates how to use the @curl-runner/core library
 * for weekly data gap analysis and report generation.
 */

import { CurlRunner, WeeklyReporter, DEFAULT_CONFIG } from './src/index.js';

console.log('🚀 Weekly Data Gap Analysis Example');
console.log('=====================================\n');

// Initialize the cURL runner with weekly reporting
const runner = new CurlRunner(
  './test-scripts',           // Scripts directory
  './example-logs',           // Logs directory
  './example-reports',        // Reports directory
  4                           // Number of weeks to analyze
);

console.log('📊 Weekly Reporting Configuration:');
const config = runner.getWeeklyReportingConfig();
console.log(`  - Enabled: ${config.enabled}`);
console.log(`  - Weeks: ${config.weeks}`);
console.log(`  - Reports Directory: ${config.reportsDir}`);
console.log(`  - Data Gap Analysis: ${config.dataGapAnalysis.ENABLED}`);
console.log(`  - Success Rate Threshold: ${(config.dataGapAnalysis.SUCCESS_RATE_THRESHOLD * 100).toFixed(1)}%`);
console.log(`  - Error Rate Threshold: ${(config.dataGapAnalysis.ERROR_RATE_THRESHOLD * 100).toFixed(1)}%\n`);

// Example 1: Single week analysis
console.log('📅 Example 1: Single Week Analysis');
console.log('-----------------------------------');

try {
  const weekResult = await runner.runWeeklyAnalysis(1);
  console.log(`✅ Week 1 analysis completed`);
  console.log(`   Report saved to: ${weekResult.reportPath}`);
  console.log(`   Success Rate: ${(weekResult.report.summary.overallSuccessRate * 100).toFixed(1)}%`);
  console.log(`   Data Gaps: ${weekResult.report.summary.dataGapsCount}`);
  console.log(`   Alerts: ${weekResult.report.summary.alertsCount}\n`);
} catch (error) {
  console.error(`❌ Week 1 analysis failed: ${error.message}\n`);
}

// Example 2: Multi-week analysis
console.log('📊 Example 2: Multi-Week Analysis');
console.log('----------------------------------');

try {
  const multiWeekResult = await runner.runMultiWeekAnalysis();
  if (multiWeekResult) {
    console.log(`✅ Multi-week analysis completed`);
    console.log(`   Total Weeks: ${multiWeekResult.summaryReport.metadata.totalWeeks}`);
    console.log(`   Average Success Rate: ${(multiWeekResult.summaryReport.overallMetrics.averageSuccessRate * 100).toFixed(1)}%`);
    console.log(`   Total Data Gaps: ${multiWeekResult.summaryReport.overallMetrics.totalDataGaps}`);
    console.log(`   Success Trend: ${multiWeekResult.summaryReport.trends.successRateTrend}`);
    console.log(`   Summary Report: ${multiWeekResult.summaryPath}\n`);
  }
} catch (error) {
  console.error(`❌ Multi-week analysis failed: ${error.message}\n`);
}

// Example 3: Direct WeeklyReporter usage
console.log('🔧 Example 3: Direct WeeklyReporter Usage');
console.log('------------------------------------------');

const reporter = new WeeklyReporter('./example-reports', 4);

// Simulate week data
const mockWeekData = {
  week: 1,
  scripts: [
    {
      name: 'test-api.sh',
      results: [
        { success: true, output: 'Success', httpStatus: 200, duration: 150 },
        { success: true, output: 'Success', httpStatus: 200, duration: 120 },
        { success: false, output: 'Error', httpStatus: 500, duration: 200 }
      ]
    },
    {
      name: 'health-check.sh',
      results: [
        { success: true, output: 'Healthy', httpStatus: 200, duration: 80 },
        { success: true, output: 'Healthy', httpStatus: 200, duration: 90 }
      ]
    }
  ]
};

try {
  const analysis = reporter.analyzeDataGaps(mockWeekData);
  console.log(`📈 Data Gap Analysis Results:`);
  console.log(`   Total Scripts: ${analysis.totalScripts}`);
  console.log(`   Successful: ${analysis.successfulScripts}`);
  console.log(`   Failed: ${analysis.failedScripts}`);
  console.log(`   Overall Success Rate: ${(analysis.overallSuccessRate * 100).toFixed(1)}%`);
  console.log(`   Data Gaps: ${analysis.dataGaps.length}`);
  console.log(`   Alerts: ${analysis.alerts.length}`);
  
  if (analysis.dataGaps.length > 0) {
    console.log(`\n   Data Gaps Details:`);
    analysis.dataGaps.forEach((gap, index) => {
      console.log(`     ${index + 1}. ${gap.script}: ${(gap.successRate * 100).toFixed(1)}% success (${gap.severity})`);
    });
  }
  
  if (analysis.alerts.length > 0) {
    console.log(`\n   Alerts:`);
    analysis.alerts.forEach((alert, index) => {
      console.log(`     ${index + 1}. [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.script || 'Overall'}`);
    });
  }
  
  console.log(`\n✅ Direct analysis completed\n`);
} catch (error) {
  console.error(`❌ Direct analysis failed: ${error.message}\n`);
}

console.log('🎯 Weekly Data Gap Analysis Example Complete!');
console.log('==============================================');
console.log('Check the ./example-reports directory for generated reports.');
console.log('Reports include:');
console.log('  - Individual weekly reports (JSON format)');
console.log('  - Summary report with trends and recommendations');
console.log('  - Data gap analysis with severity levels');
console.log('  - Performance metrics and alerts');