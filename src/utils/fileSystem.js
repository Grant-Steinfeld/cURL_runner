import fs from 'fs';
import path from 'path';

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
        console.log(console.log(`Directory ${scriptsDir} does not exist. Creating it...`));
        try {
          fs.mkdirSync(scriptsDir, { recursive: true });
          console.log(console.log(`✅ Created directory: ${scriptsDir}`));
        } catch (mkdirError) {
          console.error(console.error(`❌ Failed to create directory ${scriptsDir}: ${mkdirError.message}`));
          console.log(console.log(`Please create the directory manually or check permissions.`));
          return [];
        }
        return [];
      }

      const files = fs.readdirSync(scriptsDir);
      const shFiles = files.filter(file => file.endsWith('.sh'));
      
      if (shFiles.length === 0) {
        console.log(console.log(`No .sh files found in ${scriptsDir}`));
        console.log(console.log(`Add some .sh files to get started!`));
      } else {
        console.log(console.log(`Found ${shFiles.length} .sh files in ${scriptsDir}:`));
        shFiles.forEach((file, index) => {
          console.log(console.log(`  ${index + 1}. ${file}`));
        });
      }
      
      return shFiles;
    } catch (error) {
      console.error(console.error(`❌ Error scanning directory ${scriptsDir}: ${error.message}`));
      if (error.code === 'EACCES') {
        console.log(console.log(`Permission denied. Please check directory permissions.`));
      } else if (error.code === 'ENOENT') {
        console.log(console.log(`Directory not found. Please create ${scriptsDir} manually.`));
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