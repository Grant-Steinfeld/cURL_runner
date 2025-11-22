#!/usr/bin/env node

/**
 * Git Commit Tracker Daemon
 * Runs in the background to continuously track git commits and generate reports
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GitCommitTracker } from '../src/core/GitCommitTracker.js';
import { GitReportGenerator } from '../src/core/GitReportGenerator.js';
import { GitTracker } from '../src/utils/gitTracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Configuration
const CHECK_INTERVAL = parseInt(process.env.GIT_TRACKER_INTERVAL || '60000', 10); // 1 minute default
const REPORTS_DIR = process.env.GIT_REPORTS_DIR || join(PROJECT_ROOT, 'var', 'git-reports');
const DATA_DIR = process.env.GIT_TRACKER_DATA_DIR || join(PROJECT_ROOT, 'var', 'git-tracker');

// PID file for process management
const PID_FILE = join(DATA_DIR, 'git-tracker.pid');

/**
 * Write PID file
 */
async function writePidFile() {
  try {
    const fs = await import('fs');
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PID_FILE, process.pid.toString());
  } catch (error) {
    console.error(`[GitTracker] Error writing PID file: ${error.message}`);
  }
}

/**
 * Remove PID file
 */
function removePidFile() {
  try {
    const fs = await import('fs');
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }
  } catch (error) {
    // Ignore errors on cleanup
  }
}

/**
 * Setup signal handlers for graceful shutdown
 */
function setupSignalHandlers(tracker) {
  const shutdown = () => {
    console.log('\n[GitTracker] Shutting down...');
    tracker.stop();
    removePidFile();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGHUP', shutdown);

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error(`[GitTracker] Uncaught exception: ${error.message}`);
    console.error(error.stack);
    shutdown();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`[GitTracker] Unhandled rejection:`, reason);
    shutdown();
  });
}

/**
 * Main daemon function
 */
async function main() {
  console.log('[GitTracker] Starting Git Commit Tracker Daemon');
  console.log(`[GitTracker] Project root: ${PROJECT_ROOT}`);
  console.log(`[GitTracker] Check interval: ${CHECK_INTERVAL / 1000}s`);
  console.log(`[GitTracker] Reports directory: ${REPORTS_DIR}`);
  console.log(`[GitTracker] Data directory: ${DATA_DIR}`);

  // Check if this is a git repository
  if (!GitTracker.isGitRepository(PROJECT_ROOT)) {
    console.error(`[GitTracker] Error: ${PROJECT_ROOT} is not a git repository`);
    process.exit(1);
  }

  // Get repository info
  const repoInfo = GitTracker.getRepositoryInfo(PROJECT_ROOT);
  console.log(`[GitTracker] Repository: ${repoInfo.remoteUrl || 'local'}`);
  console.log(`[GitTracker] Branch: ${repoInfo.branch || 'unknown'}`);

  // Create tracker
  const tracker = new GitCommitTracker({
    projectRoot: PROJECT_ROOT,
    dataDir: DATA_DIR,
    checkInterval: CHECK_INTERVAL
  });

  // Create report generator
  const reportGenerator = new GitReportGenerator({
    projectRoot: PROJECT_ROOT,
    reportsDir: REPORTS_DIR,
    tracker
  });

  // Setup callback for new commits
  tracker.onNewCommits = (commits) => {
    console.log(`[GitTracker] Processing ${commits.length} new commit(s) for reporting...`);
    
    // Generate and save summary report
    try {
      reportGenerator.generateAndSaveSummaryReport();
    } catch (error) {
      console.error(`[GitTracker] Error generating summary report: ${error.message}`);
    }

    // Generate daily report for today
    try {
      reportGenerator.generateAndSaveDailyReport();
    } catch (error) {
      console.error(`[GitTracker] Error generating daily report: ${error.message}`);
    }
  };

  // Generate initial report
  try {
    console.log('[GitTracker] Generating initial report...');
    reportGenerator.generateAndSaveSummaryReport();
  } catch (error) {
    console.error(`[GitTracker] Error generating initial report: ${error.message}`);
  }

  // Write PID file
  await writePidFile();

  // Setup signal handlers
  setupSignalHandlers(tracker);

  // Start tracking
  tracker.start();

  console.log('[GitTracker] Daemon running. Press Ctrl+C to stop.');
  console.log('[GitTracker] Reports will be generated automatically when new commits are detected.');
}

// Run main function
main().catch(error => {
  console.error(`[GitTracker] Fatal error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});

