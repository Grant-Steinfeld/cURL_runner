/**
 * Type definitions for @curl-runner/core
 */

export interface CurlResult {
  success: boolean;
  output: string;
  httpStatus?: number;
  error?: string;
  duration: number;
  parsed?: any;
}

export interface LoggerConfig {
  logsDir: string;
  reportLogFile: string;
  errorLogFile: string;
}

export interface ConcurrentOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
}

export interface CurlRunnerConfig {
  scriptsDir: string;
  logsDir: string;
  reportLogFile: string;
  errorLogFile: string;
  scriptExtension: string;
  scriptDelayMs: number;
}

export interface ScriptInfo {
  name: string;
  path: string;
  extension: string;
}

export interface HttpErrorInfo {
  status: number;
  category: string;
  isError: boolean;
}

export declare class CurlRunner {
  constructor(config?: Partial<CurlRunnerConfig>);
  runAllScripts(): Promise<CurlResult[]>;
  runAllScriptsParallel(): Promise<CurlResult[]>;
  runAllScriptsConcurrent(options?: ConcurrentOptions): Promise<CurlResult[]>;
  runScriptsWithConcurrency(scripts: string[], maxConcurrent?: number): Promise<CurlResult[]>;
  runScript(scriptName: string): Promise<CurlResult>;
  scanScripts(): Promise<ScriptInfo[]>;
}

export declare class Logger {
  constructor(logsDir: string);
  ensureLogsDirectory(): Promise<void>;
  generateLogFilename(scriptName: string): string;
  writeLog(scriptName: string, content: string): Promise<void>;
  writeReportLog(message: string): Promise<void>;
  writeErrorLog(error: string): Promise<void>;
}

export declare class CurlParser {
  parseCurlOutput(output: string): CurlResult;
  extractHttpStatus(output: string): number | null;
  isHttpError(status: number): boolean;
  getErrorCategory(status: number): string;
}

export declare class FileSystem {
  scanScripts(directory: string): Promise<ScriptInfo[]>;
  fileExists(filePath: string): Promise<boolean>;
  ensureDirectory(dirPath: string): Promise<void>;
  getFileExtension(filePath: string): string;
  joinPath(...paths: string[]): string;
  getDirName(filePath: string): string;
  getBaseName(filePath: string): string;
}

export declare const DEFAULT_CONFIG: CurlRunnerConfig;
export declare const VERSION: string;
export declare const LIBRARY_NAME: string;

// Compatibility functions
export interface CompatibilityStatus {
  currentVersion: string;
  minCompatibility: {
    isCompatible: boolean;
    isMinCompatible: boolean;
    isMaxCompatible: boolean;
    minVersion: string;
    maxVersion: string;
  };
  recommendedCompatibility: {
    isCompatible: boolean;
    isMinCompatible: boolean;
    isMaxCompatible: boolean;
    minVersion: string;
    maxVersion: string;
  };
  testedCompatibility: {
    isCompatible: boolean;
    isMinCompatible: boolean;
    isMaxCompatible: boolean;
    minVersion: string;
    maxVersion: string;
  };
  isSupported: boolean;
  isRecommended: boolean;
  isTested: boolean;
}

export interface CompatibilityMatrix {
  current: string;
  minimum: string;
  recommended: {
    min: string;
    max: string;
  };
  tested: {
    min: string;
    max: string;
  };
  status: {
    isSupported: boolean;
    isRecommended: boolean;
    isTested: boolean;
  };
}

export interface CompatibilityOptions {
  strict?: boolean;
  warn?: boolean;
}

export declare function enforceCompatibility(options?: CompatibilityOptions): CompatibilityStatus;
export declare function getCompatibilityInfo(): CompatibilityStatus;
export declare function isTestedVersion(): boolean;
export declare function isRecommendedVersion(): boolean;
export declare function getCompatibilityMatrix(): CompatibilityMatrix;