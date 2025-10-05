import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Utility functions for file system operations
 */
export class FileSystem {
  /**
   * Scan directory for .sh files
   */
  static scanScripts(scriptsDir) {
    try {
      if (!fs.existsSync(scriptsDir)) {
        console.log(chalk.yellow(`Directory ${scriptsDir} does not exist. Creating it...`));
        fs.mkdirSync(scriptsDir, { recursive: true });
        return [];
      }

      const files = fs.readdirSync(scriptsDir);
      const shFiles = files.filter(file => file.endsWith('.sh'));
      
      console.log(chalk.blue(`Found ${shFiles.length} .sh files in ${scriptsDir}:`));
      shFiles.forEach((file, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${file}`));
      });
      
      return shFiles;
    } catch (error) {
      console.error(chalk.red(`Error scanning directory: ${error.message}`));
      return [];
    }
  }

  /**
   * Check if file exists
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Ensure directory exists
   */
  static ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
    }
    return false;
  }

  /**
   * Get file extension
   */
  static getFileExtension(filename) {
    return path.extname(filename);
  }

  /**
   * Join paths safely
   */
  static joinPath(...paths) {
    return path.join(...paths);
  }

  /**
   * Get directory name from path
   */
  static getDirName(filePath) {
    return path.dirname(filePath);
  }

  /**
   * Get base name from path
   */
  static getBaseName(filePath) {
    return path.basename(filePath);
  }
}