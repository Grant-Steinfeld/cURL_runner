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
        try {
          fs.mkdirSync(scriptsDir, { recursive: true });
          console.log(chalk.green(`✅ Created directory: ${scriptsDir}`));
        } catch (mkdirError) {
          console.error(chalk.red(`❌ Failed to create directory ${scriptsDir}: ${mkdirError.message}`));
          console.log(chalk.yellow(`Please create the directory manually or check permissions.`));
          return [];
        }
        return [];
      }

      const files = fs.readdirSync(scriptsDir);
      const shFiles = files.filter(file => file.endsWith('.sh'));
      
      if (shFiles.length === 0) {
        console.log(chalk.yellow(`No .sh files found in ${scriptsDir}`));
        console.log(chalk.gray(`Add some .sh files to get started!`));
      } else {
        console.log(chalk.blue(`Found ${shFiles.length} .sh files in ${scriptsDir}:`));
        shFiles.forEach((file, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${file}`));
        });
      }
      
      return shFiles;
    } catch (error) {
      console.error(chalk.red(`❌ Error scanning directory ${scriptsDir}: ${error.message}`));
      if (error.code === 'EACCES') {
        console.log(chalk.yellow(`Permission denied. Please check directory permissions.`));
      } else if (error.code === 'ENOENT') {
        console.log(chalk.yellow(`Directory not found. Please create ${scriptsDir} manually.`));
      }
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