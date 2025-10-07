import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG } from '../config/defaults.js';

/**
 * WeeklyReporter class for generating weekly data gap analysis reports
 */
export class WeeklyReporter {
  constructor(reportsDir = DEFAULT_CONFIG.WEEKLY_REPORTING.REPORT_DIR, weeks = DEFAULT_CONFIG.WEEKLY_REPORTING.DEFAULT_WEEKS) {
    this.reportsDir = reportsDir;
    this.weeks = Math.max(
      DEFAULT_CONFIG.WEEKLY_REPORTING.MIN_WEEKS,
      Math.min(weeks, DEFAULT_CONFIG.WEEKLY_REPORTING.MAX_WEEKS)
    );
    this.ensureReportsDirectory();
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
      console.log(`[INFO] Created reports directory: ${this.reportsDir}`);
    }
  }

  /**
   * Generate weekly report filename
   */
  generateWeeklyReportFilename(weekNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `weekly-report-${year}-${month}-${day}-week-${weekNumber}.json`;
  }

  /**
   * Analyze data gaps for a specific week
   */
  analyzeDataGaps(weekData) {
    const analysis = {
      week: weekData.week,
      totalScripts: weekData.scripts.length,
      successfulScripts: 0,
      failedScripts: 0,
      dataGaps: [],
      errorRates: {},
      successRates: {},
      trends: {},
      alerts: []
    };

    // Analyze each script
    weekData.scripts.forEach(script => {
      const successCount = script.results.filter(r => r.success).length;
      const totalCount = script.results.length;
      const successRate = totalCount > 0 ? successCount / totalCount : 0;
      const errorRate = 1 - successRate;

      analysis.successRates[script.name] = successRate;
      analysis.errorRates[script.name] = errorRate;

      if (successRate >= DEFAULT_CONFIG.DATA_GAP_ANALYSIS.SUCCESS_RATE_THRESHOLD) {
        analysis.successfulScripts++;
      } else {
        analysis.failedScripts++;
      }

      // Check for data gaps
      if (successRate < DEFAULT_CONFIG.DATA_GAP_ANALYSIS.SUCCESS_RATE_THRESHOLD) {
        analysis.dataGaps.push({
          script: script.name,
          successRate,
          missingData: 1 - successRate,
          severity: successRate < 0.5 ? 'critical' : successRate < 0.8 ? 'high' : 'medium'
        });
      }

      // Check for error rate alerts
      if (errorRate > DEFAULT_CONFIG.DATA_GAP_ANALYSIS.ERROR_RATE_THRESHOLD) {
        analysis.alerts.push({
          type: 'error_rate',
          script: script.name,
          errorRate,
          threshold: DEFAULT_CONFIG.DATA_GAP_ANALYSIS.ERROR_RATE_THRESHOLD,
          severity: errorRate > 0.2 ? 'critical' : 'high'
        });
      }
    });

    // Calculate overall metrics
    analysis.overallSuccessRate = analysis.totalScripts > 0 ? 
      analysis.successfulScripts / analysis.totalScripts : 0;
    analysis.overallErrorRate = 1 - analysis.overallSuccessRate;

    // Generate alerts for overall performance
    if (analysis.overallSuccessRate < DEFAULT_CONFIG.DATA_GAP_ANALYSIS.SUCCESS_RATE_THRESHOLD) {
      analysis.alerts.push({
        type: 'overall_performance',
        overallSuccessRate: analysis.overallSuccessRate,
        threshold: DEFAULT_CONFIG.DATA_GAP_ANALYSIS.SUCCESS_RATE_THRESHOLD,
        severity: analysis.overallSuccessRate < 0.5 ? 'critical' : 'high'
      });
    }

    return analysis;
  }

  /**
   * Generate weekly report
   */
  generateWeeklyReport(weekData) {
    const analysis = this.analyzeDataGaps(weekData);
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        week: analysis.week,
        totalWeeks: this.weeks,
        reportVersion: '1.0.0'
      },
      summary: {
        totalScripts: analysis.totalScripts,
        successfulScripts: analysis.successfulScripts,
        failedScripts: analysis.failedScripts,
        overallSuccessRate: analysis.overallSuccessRate,
        overallErrorRate: analysis.overallErrorRate,
        dataGapsCount: analysis.dataGaps.length,
        alertsCount: analysis.alerts.length
      },
      analysis: analysis,
      recommendations: this.generateRecommendations(analysis)
    };

    return report;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Data gap recommendations
    if (analysis.dataGaps.length > 0) {
      const criticalGaps = analysis.dataGaps.filter(gap => gap.severity === 'critical');
      const highGaps = analysis.dataGaps.filter(gap => gap.severity === 'high');

      if (criticalGaps.length > 0) {
        recommendations.push({
          priority: 'critical',
          category: 'data_gaps',
          message: `Critical data gaps detected in ${criticalGaps.length} script(s)`,
          scripts: criticalGaps.map(gap => gap.script),
          action: 'Immediate investigation and remediation required'
        });
      }

      if (highGaps.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'data_gaps',
          message: `High priority data gaps detected in ${highGaps.length} script(s)`,
          scripts: highGaps.map(gap => gap.script),
          action: 'Schedule investigation within 24 hours'
        });
      }
    }

    // Error rate recommendations
    const criticalErrors = analysis.alerts.filter(alert => 
      alert.type === 'error_rate' && alert.severity === 'critical'
    );

    if (criticalErrors.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'error_rates',
        message: `Critical error rates detected in ${criticalErrors.length} script(s)`,
        scripts: criticalErrors.map(alert => alert.script),
        action: 'Check API endpoints and script configurations immediately'
      });
    }

    // Overall performance recommendations
    if (analysis.overallSuccessRate < 0.8) {
      recommendations.push({
        priority: 'high',
        category: 'overall_performance',
        message: `Overall success rate is ${(analysis.overallSuccessRate * 100).toFixed(1)}%`,
        action: 'Review all scripts and consider system-wide improvements'
      });
    }

    return recommendations;
  }

  /**
   * Save weekly report to file
   */
  async saveWeeklyReport(report) {
    const filename = this.generateWeeklyReportFilename(report.analysis.week);
    const filepath = path.join(this.reportsDir, filename);
    
    try {
      await fs.promises.writeFile(filepath, JSON.stringify(report, null, 2));
      console.log(`[REPORT] Weekly report saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(`[ERROR] Failed to save weekly report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate summary report for all weeks
   */
  generateSummaryReport(weeklyReports) {
    const summary = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalWeeks: weeklyReports.length,
        reportVersion: '1.0.0'
      },
      overallMetrics: {
        totalScripts: 0,
        totalSuccessfulScripts: 0,
        totalFailedScripts: 0,
        averageSuccessRate: 0,
        totalDataGaps: 0,
        totalAlerts: 0
      },
      weeklyBreakdown: [],
      trends: {
        successRateTrend: 'stable',
        dataGapsTrend: 'stable',
        errorRateTrend: 'stable'
      },
      recommendations: []
    };

    // Aggregate metrics
    weeklyReports.forEach(report => {
      summary.overallMetrics.totalScripts += report.summary.totalScripts;
      summary.overallMetrics.totalSuccessfulScripts += report.summary.successfulScripts;
      summary.overallMetrics.totalFailedScripts += report.summary.failedScripts;
      summary.overallMetrics.totalDataGaps += report.summary.dataGapsCount;
      summary.overallMetrics.totalAlerts += report.summary.alertsCount;

      summary.weeklyBreakdown.push({
        week: report.analysis.week,
        successRate: report.summary.overallSuccessRate,
        dataGapsCount: report.summary.dataGapsCount,
        alertsCount: report.summary.alertsCount
      });
    });

    // Calculate averages
    if (weeklyReports.length > 0) {
      summary.overallMetrics.averageSuccessRate = 
        summary.overallMetrics.totalSuccessfulScripts / summary.overallMetrics.totalScripts;
    }

    // Analyze trends
    if (weeklyReports.length >= 2) {
      const recentWeeks = weeklyReports.slice(-2);
      const olderWeeks = weeklyReports.slice(-4, -2);

      if (recentWeeks.length >= 2 && olderWeeks.length >= 2) {
        const recentAvgSuccess = recentWeeks.reduce((sum, r) => sum + r.summary.overallSuccessRate, 0) / recentWeeks.length;
        const olderAvgSuccess = olderWeeks.reduce((sum, r) => sum + r.summary.overallSuccessRate, 0) / olderWeeks.length;

        if (recentAvgSuccess > olderAvgSuccess * 1.05) {
          summary.trends.successRateTrend = 'improving';
        } else if (recentAvgSuccess < olderAvgSuccess * 0.95) {
          summary.trends.successRateTrend = 'declining';
        }
      }
    }

    return summary;
  }

  /**
   * Save summary report
   */
  async saveSummaryReport(summary) {
    const filepath = path.join(this.reportsDir, DEFAULT_CONFIG.WEEKLY_REPORTING.SUMMARY_REPORT_FILE);
    
    try {
      await fs.promises.writeFile(filepath, JSON.stringify(summary, null, 2));
      console.log(`[REPORT] Summary report saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(`[ERROR] Failed to save summary report: ${error.message}`);
      throw error;
    }
  }
}
