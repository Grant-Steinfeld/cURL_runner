#!/usr/bin/env node

/**
 * View Git Commit Reports
 * Displays summary or daily reports in a readable format
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const REPORTS_DIR = join(PROJECT_ROOT, 'var', 'git-reports');

const reportType = process.argv[2] || 'summary';
const dateArg = process.argv[3];

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Display summary report
 */
function displaySummaryReport(report) {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           Git Commit Tracker - Summary Report                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Generated: ${formatDate(report.metadata.generatedAt)}\n`);
  
  if (report.summary.totalCommits === 0) {
    console.log('No commits tracked yet.\n');
    return;
  }

  // Overall statistics
  console.log('📊 Overall Statistics');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`Total Commits:        ${formatNumber(report.summary.totalCommits)}`);
  console.log(`Last 24 Hours:        ${formatNumber(report.summary.timeRanges.last24Hours)}`);
  console.log(`Last 7 Days:          ${formatNumber(report.summary.timeRanges.last7Days)}`);
  console.log(`Last 30 Days:         ${formatNumber(report.summary.timeRanges.last30Days)}`);
  console.log('');

  // Changes
  console.log('📝 Code Changes');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`Files Changed:        ${formatNumber(report.summary.changes.totalFilesChanged)}`);
  console.log(`Insertions:           ${formatNumber(report.summary.changes.totalInsertions)}`);
  console.log(`Deletions:            ${formatNumber(report.summary.changes.totalDeletions)}`);
  console.log(`Net Changes:          ${formatNumber(report.summary.changes.netChanges)}`);
  console.log(`Avg Files/Commit:     ${report.summary.changes.averageFilesPerCommit}`);
  console.log(`Avg Changes/Commit:   ${report.summary.changes.averageChangesPerCommit}`);
  console.log('');

  // Top contributors
  if (report.authors && report.authors.topContributors.length > 0) {
    console.log('👥 Top Contributors');
    console.log('─────────────────────────────────────────────────────────────');
    report.authors.topContributors.slice(0, 5).forEach((author, index) => {
      console.log(`${index + 1}. ${author.name.padEnd(25)} ${formatNumber(author.commits).padStart(6)} commits`);
    });
    console.log('');
  }

  // Recent commits
  if (report.recentCommits && report.recentCommits.length > 0) {
    console.log('🕐 Recent Commits');
    console.log('─────────────────────────────────────────────────────────────');
    report.recentCommits.slice(0, 5).forEach(commit => {
      const shortMessage = commit.message.length > 50 
        ? commit.message.substring(0, 47) + '...' 
        : commit.message;
      console.log(`${commit.hash}  ${shortMessage.padEnd(50)}`);
      console.log(`      ${commit.author} - ${formatDate(commit.date)}`);
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Display daily report
 */
function displayDailyReport(report) {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║         Git Commit Tracker - Daily Report (${report.metadata.date})      ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Generated: ${formatDate(report.metadata.generatedAt)}\n`);
  
  if (report.summary.totalCommits === 0) {
    console.log('No commits on this day.\n');
    return;
  }

  console.log('📊 Daily Statistics');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`Total Commits:        ${formatNumber(report.summary.totalCommits)}`);
  console.log(`Files Changed:        ${formatNumber(report.summary.filesChanged)}`);
  console.log(`Insertions:           ${formatNumber(report.summary.insertions)}`);
  console.log(`Deletions:            ${formatNumber(report.summary.deletions)}`);
  console.log('');

  if (report.commits && report.commits.length > 0) {
    console.log('📝 Commits');
    console.log('─────────────────────────────────────────────────────────────');
    report.commits.forEach(commit => {
      const shortMessage = commit.message.length > 50 
        ? commit.message.substring(0, 47) + '...' 
        : commit.message;
      console.log(`${commit.hash}  ${shortMessage}`);
      console.log(`      ${commit.author} - ${formatDate(commit.date)}`);
      console.log(`      ${commit.filesChanged} files, ${formatNumber(commit.changes)} changes`);
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Main function
 */
function main() {
  let reportPath;

  if (reportType === 'summary') {
    reportPath = join(REPORTS_DIR, 'summary-report.json');
  } else if (reportType === 'daily') {
    const date = dateArg || new Date().toISOString().split('T')[0];
    reportPath = join(REPORTS_DIR, `daily-report-${date}.json`);
  } else {
    console.error('Usage: node view-git-report.mjs [summary|daily] [date]');
    console.error('  summary - View summary report (default)');
    console.error('  daily   - View daily report (defaults to today, or specify YYYY-MM-DD)');
    process.exit(1);
  }

  if (!fs.existsSync(reportPath)) {
    console.error(`Report not found: ${reportPath}`);
    console.error('Make sure the git tracker is running and has generated reports.');
    process.exit(1);
  }

  try {
    const reportData = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportData);

    if (reportType === 'summary') {
      displaySummaryReport(report);
    } else {
      displayDailyReport(report);
    }
  } catch (error) {
    console.error(`Error reading report: ${error.message}`);
    process.exit(1);
  }
}

main();

