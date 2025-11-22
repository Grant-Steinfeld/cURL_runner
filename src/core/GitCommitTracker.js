import fs from 'fs';
import path from 'path';
import { GitTracker } from '../utils/gitTracker.js';
import { FileSystem } from '../utils/fileSystem.js';

/**
 * GitCommitTracker - Monitors git commits and tracks changes
 */
export class GitCommitTracker {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.dataDir = options.dataDir || path.join(this.projectRoot, 'var', 'git-tracker');
    this.checkInterval = options.checkInterval || 60000; // 1 minute default
    this.lastKnownCommit = null;
    this.isRunning = false;
    this.timer = null;
    
    // Ensure data directory exists
    FileSystem.ensureDirectory(this.dataDir);
    
    // Load last known commit
    this.loadLastKnownCommit();
  }

  /**
   * Load last known commit from storage
   */
  loadLastKnownCommit() {
    const stateFile = path.join(this.dataDir, 'last-commit.json');
    
    try {
      if (fs.existsSync(stateFile)) {
        const data = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        this.lastKnownCommit = data.lastKnownCommit;
        this.lastCheckTime = data.lastCheckTime ? new Date(data.lastCheckTime) : new Date();
      } else {
        // Initialize with current HEAD
        const currentCommit = GitTracker.getLatestCommitHash(this.projectRoot);
        this.lastKnownCommit = currentCommit;
        this.lastCheckTime = new Date();
        this.saveState();
      }
    } catch (error) {
      console.error(`[GitTracker] Error loading state: ${error.message}`);
      const currentCommit = GitTracker.getLatestCommitHash(this.projectRoot);
      this.lastKnownCommit = currentCommit;
      this.lastCheckTime = new Date();
    }
  }

  /**
   * Save current state to storage
   */
  saveState() {
    const stateFile = path.join(this.dataDir, 'last-commit.json');
    
    try {
      const data = {
        lastKnownCommit: this.lastKnownCommit,
        lastCheckTime: this.lastCheckTime.toISOString()
      };
      fs.writeFileSync(stateFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`[GitTracker] Error saving state: ${error.message}`);
    }
  }

  /**
   * Check for new commits
   */
  checkForNewCommits() {
    if (!GitTracker.isGitRepository(this.projectRoot)) {
      console.warn(`[GitTracker] Not a git repository: ${this.projectRoot}`);
      return [];
    }

    const currentCommit = GitTracker.getLatestCommitHash(this.projectRoot);
    
    if (!currentCommit) {
      return [];
    }

    // If no last known commit, initialize with current
    if (!this.lastKnownCommit) {
      this.lastKnownCommit = currentCommit;
      this.saveState();
      return [];
    }

    // If commit hasn't changed, no new commits
    if (currentCommit === this.lastKnownCommit) {
      return [];
    }

    // Get new commits
    const newCommits = GitTracker.getCommitsSince(this.lastKnownCommit, this.projectRoot);
    
    if (newCommits.length > 0) {
      // Update last known commit
      this.lastKnownCommit = currentCommit;
      this.lastCheckTime = new Date();
      this.saveState();
      
      // Enrich commits with additional data
      const enrichedCommits = newCommits.map(commit => {
        const stats = GitTracker.getCommitStats(commit.hash, this.projectRoot);
        const files = GitTracker.getCommitFiles(commit.hash, this.projectRoot);
        
        return {
          ...commit,
          ...stats,
          files,
          trackedAt: new Date()
        };
      });

      return enrichedCommits;
    }

    return [];
  }

  /**
   * Store commit data
   */
  storeCommits(commits) {
    if (commits.length === 0) {
      return;
    }

    const commitsFile = path.join(this.dataDir, 'commits.json');
    let allCommits = [];

    // Load existing commits
    try {
      if (fs.existsSync(commitsFile)) {
        const data = JSON.parse(fs.readFileSync(commitsFile, 'utf8'));
        allCommits = data.commits || [];
      }
    } catch (error) {
      console.error(`[GitTracker] Error loading commits: ${error.message}`);
    }

    // Add new commits (avoid duplicates)
    const existingHashes = new Set(allCommits.map(c => c.hash));
    const newCommits = commits.filter(c => !existingHashes.has(c.hash));
    
    allCommits = [...newCommits, ...allCommits];

    // Keep only last 1000 commits to prevent file from growing too large
    if (allCommits.length > 1000) {
      allCommits = allCommits.slice(0, 1000);
    }

    // Save commits
    try {
      fs.writeFileSync(
        commitsFile,
        JSON.stringify({ commits: allCommits, lastUpdated: new Date().toISOString() }, null, 2)
      );
    } catch (error) {
      console.error(`[GitTracker] Error saving commits: ${error.message}`);
    }
  }

  /**
   * Start tracking (runs check periodically)
   */
  start() {
    if (this.isRunning) {
      console.log('[GitTracker] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[GitTracker] Starting commit tracker (checking every ${this.checkInterval / 1000}s)`);

    // Initial check
    this.performCheck();

    // Set up periodic checks
    this.timer = setInterval(() => {
      this.performCheck();
    }, this.checkInterval);
  }

  /**
   * Perform a check for new commits
   */
  performCheck() {
    try {
      const newCommits = this.checkForNewCommits();
      
      if (newCommits.length > 0) {
        console.log(`[GitTracker] Found ${newCommits.length} new commit(s)`);
        this.storeCommits(newCommits);
        
        // Emit event for report generation
        this.onNewCommits(newCommits);
      }
    } catch (error) {
      console.error(`[GitTracker] Error during check: ${error.message}`);
    }
  }

  /**
   * Callback for when new commits are detected
   * Override this or listen to events
   */
  onNewCommits(commits) {
    // Override in subclass or use event emitter
  }

  /**
   * Stop tracking
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    console.log('[GitTracker] Stopped commit tracker');
  }

  /**
   * Get all tracked commits
   */
  getAllCommits() {
    const commitsFile = path.join(this.dataDir, 'commits.json');
    
    try {
      if (fs.existsSync(commitsFile)) {
        const data = JSON.parse(fs.readFileSync(commitsFile, 'utf8'));
        return data.commits || [];
      }
    } catch (error) {
      console.error(`[GitTracker] Error loading commits: ${error.message}`);
    }

    return [];
  }

  /**
   * Get commits within a date range
   */
  getCommitsInRange(startDate, endDate) {
    const allCommits = this.getAllCommits();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return allCommits.filter(commit => {
      const commitDate = new Date(commit.date);
      return commitDate >= start && commitDate <= end;
    });
  }
}

