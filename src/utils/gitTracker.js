import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Utility functions for git operations
 */
export class GitTracker {
  /**
   * Execute git command and return output
   */
  static execGitCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        cwd: options.cwd || process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return result.trim();
    } catch (error) {
      if (options.silent) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if current directory is a git repository
   */
  static isGitRepository(cwd = process.cwd()) {
    try {
      this.execGitCommand('git rev-parse --git-dir', { cwd, silent: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  static getCurrentBranch(cwd = process.cwd()) {
    try {
      return this.execGitCommand('git rev-parse --abbrev-ref HEAD', { cwd });
    } catch {
      return null;
    }
  }

  /**
   * Get latest commit hash
   */
  static getLatestCommitHash(cwd = process.cwd()) {
    try {
      return this.execGitCommand('git rev-parse HEAD', { cwd });
    } catch {
      return null;
    }
  }

  /**
   * Get commits since a specific commit hash
   */
  static getCommitsSince(hash, cwd = process.cwd()) {
    try {
      const output = this.execGitCommand(
        `git log ${hash}..HEAD --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso`,
        { cwd }
      );
      
      if (!output) {
        return [];
      }

      return output.split('\n').map(line => {
        const [commitHash, author, email, date, ...messageParts] = line.split('|');
        return {
          hash: commitHash,
          author,
          email,
          date: new Date(date),
          message: messageParts.join('|')
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Get all commits with details
   */
  static getCommits(limit = 100, cwd = process.cwd()) {
    try {
      const output = this.execGitCommand(
        `git log -n ${limit} --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso`,
        { cwd }
      );
      
      if (!output) {
        return [];
      }

      return output.split('\n').map(line => {
        const [commitHash, author, email, date, ...messageParts] = line.split('|');
        return {
          hash: commitHash,
          author,
          email,
          date: new Date(date),
          message: messageParts.join('|'),
          shortHash: commitHash.substring(0, 7)
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Get commit statistics (files changed, insertions, deletions)
   */
  static getCommitStats(hash, cwd = process.cwd()) {
    try {
      const output = this.execGitCommand(
        `git show --stat --format="" ${hash}`,
        { cwd }
      );
      
      if (!output) {
        return { filesChanged: 0, insertions: 0, deletions: 0 };
      }

      const lines = output.split('\n').filter(line => line.trim());
      const summaryLine = lines[lines.length - 1];
      
      let filesChanged = 0;
      let insertions = 0;
      let deletions = 0;

      if (summaryLine) {
        const fileMatch = summaryLine.match(/(\d+)\s+files? changed/);
        const insertionMatch = summaryLine.match(/(\d+)\s+insertions?/);
        const deletionMatch = summaryLine.match(/(\d+)\s+deletions?/);

        filesChanged = fileMatch ? parseInt(fileMatch[1], 10) : 0;
        insertions = insertionMatch ? parseInt(insertionMatch[1], 10) : 0;
        deletions = deletionMatch ? parseInt(deletionMatch[1], 10) : 0;
      }

      return { filesChanged, insertions, deletions };
    } catch {
      return { filesChanged: 0, insertions: 0, deletions: 0 };
    }
  }

  /**
   * Get commit files changed
   */
  static getCommitFiles(hash, cwd = process.cwd()) {
    try {
      const output = this.execGitCommand(
        `git diff-tree --no-commit-id --name-only -r ${hash}`,
        { cwd }
      );
      return output ? output.split('\n').filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get repository information
   */
  static getRepositoryInfo(cwd = process.cwd()) {
    try {
      const remoteUrl = this.execGitCommand('git config --get remote.origin.url', { cwd, silent: true });
      const branch = this.getCurrentBranch(cwd);
      const latestCommit = this.getLatestCommitHash(cwd);
      
      return {
        remoteUrl: remoteUrl || null,
        branch: branch || null,
        latestCommit: latestCommit || null,
        isGitRepo: this.isGitRepository(cwd)
      };
    } catch {
      return {
        remoteUrl: null,
        branch: null,
        latestCommit: null,
        isGitRepo: false
      };
    }
  }
}

