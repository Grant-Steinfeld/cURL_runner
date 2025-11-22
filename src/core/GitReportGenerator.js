import fs from 'fs';
import path from 'path';
import { FileSystem } from '../utils/fileSystem.js';

/**
 * GitReportGenerator - Generates dynamic reports from git commit data
 */
export class GitReportGenerator {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.reportsDir = options.reportsDir || path.join(this.projectRoot, 'var', 'git-reports');
    this.tracker = options.tracker;
    
    // Ensure reports directory exists
    FileSystem.ensureDirectory(this.reportsDir);
  }

  /**
   * Generate summary report
   */
  generateSummaryReport(commits = null) {
    const allCommits = commits || this.tracker?.getAllCommits() || [];
    
    if (allCommits.length === 0) {
      return this.generateEmptyReport();
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const commits24h = allCommits.filter(c => new Date(c.date) >= last24Hours);
    const commits7d = allCommits.filter(c => new Date(c.date) >= last7Days);
    const commits30d = allCommits.filter(c => new Date(c.date) >= last30Days);

    // Calculate statistics
    const stats = {
      totalCommits: allCommits.length,
      commits24h: commits24h.length,
      commits7d: commits7d.length,
      commits30d: commits30d.length,
      totalFilesChanged: allCommits.reduce((sum, c) => sum + (c.filesChanged || 0), 0),
      totalInsertions: allCommits.reduce((sum, c) => sum + (c.insertions || 0), 0),
      totalDeletions: allCommits.reduce((sum, c) => sum + (c.deletions || 0), 0),
      netChanges: 0,
      averageFilesPerCommit: 0,
      averageChangesPerCommit: 0
    };

    stats.netChanges = stats.totalInsertions - stats.totalDeletions;
    stats.averageFilesPerCommit = stats.totalCommits > 0 
      ? (stats.totalFilesChanged / stats.totalCommits).toFixed(2) 
      : 0;
    stats.averageChangesPerCommit = stats.totalCommits > 0
      ? ((stats.totalInsertions + stats.totalDeletions) / stats.totalCommits).toFixed(2)
      : 0;

    // Author statistics
    const authorStats = this.calculateAuthorStats(allCommits);
    
    // File statistics
    const fileStats = this.calculateFileStats(allCommits);
    
    // Time-based statistics
    const timeStats = this.calculateTimeStats(allCommits);

    const report = {
      metadata: {
        generatedAt: now.toISOString(),
        reportType: 'summary',
        reportVersion: '1.0.0'
      },
      summary: {
        totalCommits: stats.totalCommits,
        timeRanges: {
          last24Hours: stats.commits24h,
          last7Days: stats.commits7d,
          last30Days: stats.commits30d
        },
        changes: {
          totalFilesChanged: stats.totalFilesChanged,
          totalInsertions: stats.totalInsertions,
          totalDeletions: stats.totalDeletions,
          netChanges: stats.netChanges,
          averageFilesPerCommit: parseFloat(stats.averageFilesPerCommit),
          averageChangesPerCommit: parseFloat(stats.averageChangesPerCommit)
        }
      },
      authors: authorStats,
      files: fileStats,
      timeline: timeStats,
      recentCommits: allCommits.slice(0, 10).map(c => ({
        hash: c.shortHash || c.hash.substring(0, 7),
        author: c.author,
        date: c.date,
        message: c.message,
        filesChanged: c.filesChanged || 0,
        changes: (c.insertions || 0) + (c.deletions || 0)
      }))
    };

    return report;
  }

  /**
   * Calculate author statistics
   */
  calculateAuthorStats(commits) {
    const authorMap = new Map();

    commits.forEach(commit => {
      const author = commit.author || 'Unknown';
      if (!authorMap.has(author)) {
        authorMap.set(author, {
          name: author,
          email: commit.email || '',
          commits: 0,
          filesChanged: 0,
          insertions: 0,
          deletions: 0
        });
      }

      const stats = authorMap.get(author);
      stats.commits++;
      stats.filesChanged += commit.filesChanged || 0;
      stats.insertions += commit.insertions || 0;
      stats.deletions += commit.deletions || 0;
    });

    const authors = Array.from(authorMap.values())
      .sort((a, b) => b.commits - a.commits);

    return {
      total: authors.length,
      topContributors: authors.slice(0, 10),
      breakdown: authors
    };
  }

  /**
   * Calculate file statistics
   */
  calculateFileStats(commits) {
    const fileMap = new Map();

    commits.forEach(commit => {
      const files = commit.files || [];
      files.forEach(file => {
        if (!fileMap.has(file)) {
          fileMap.set(file, {
            path: file,
            timesChanged: 0,
            lastChanged: commit.date
          });
        }

        const stats = fileMap.get(file);
        stats.timesChanged++;
        const commitDate = new Date(commit.date);
        if (commitDate > new Date(stats.lastChanged)) {
          stats.lastChanged = commit.date;
        }
      });
    });

    const files = Array.from(fileMap.values())
      .sort((a, b) => b.timesChanged - a.timesChanged);

    return {
      totalFiles: files.length,
      mostChanged: files.slice(0, 20)
    };
  }

  /**
   * Calculate time-based statistics
   */
  calculateTimeStats(commits) {
    const hourly = new Array(24).fill(0);
    const daily = new Array(7).fill(0); // 0 = Sunday, 6 = Saturday
    const monthly = {};

    commits.forEach(commit => {
      const date = new Date(commit.date);
      const hour = date.getHours();
      const day = date.getDay();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      hourly[hour]++;
      daily[day]++;
      
      if (!monthly[monthKey]) {
        monthly[monthKey] = 0;
      }
      monthly[monthKey]++;
    });

    return {
      byHour: hourly,
      byDayOfWeek: daily,
      byMonth: monthly
    };
  }

  /**
   * Generate empty report
   */
  generateEmptyReport() {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportType: 'summary',
        reportVersion: '1.0.0'
      },
      summary: {
        totalCommits: 0,
        message: 'No commits tracked yet'
      }
    };
  }

  /**
   * Generate daily report
   */
  generateDailyReport(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const commits = this.tracker?.getCommitsInRange(startOfDay, endOfDay) || [];

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportType: 'daily',
        date: date.toISOString().split('T')[0],
        reportVersion: '1.0.0'
      },
      summary: {
        totalCommits: commits.length,
        filesChanged: commits.reduce((sum, c) => sum + (c.filesChanged || 0), 0),
        insertions: commits.reduce((sum, c) => sum + (c.insertions || 0), 0),
        deletions: commits.reduce((sum, c) => sum + (c.deletions || 0), 0)
      },
      commits: commits.map(c => ({
        hash: c.shortHash || c.hash.substring(0, 7),
        author: c.author,
        date: c.date,
        message: c.message,
        filesChanged: c.filesChanged || 0,
        changes: (c.insertions || 0) + (c.deletions || 0)
      }))
    };
  }

  /**
   * Save report to file
   */
  saveReport(report, filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const reportType = report.metadata.reportType || 'summary';
      filename = `${reportType}-report-${timestamp}.json`;
    }

    const filepath = path.join(this.reportsDir, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`[GitReport] Report saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(`[GitReport] Error saving report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate and save summary report
   */
  generateAndSaveSummaryReport() {
    const report = this.generateSummaryReport();
    const filename = 'summary-report.json';
    return this.saveReport(report, filename);
  }

  /**
   * Generate and save daily report
   */
  generateAndSaveDailyReport(date = new Date()) {
    const report = this.generateDailyReport(date);
    const dateStr = date.toISOString().split('T')[0];
    const filename = `daily-report-${dateStr}.json`;
    return this.saveReport(report, filename);
  }
}

