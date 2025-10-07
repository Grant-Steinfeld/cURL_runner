# @curl-runner/core

[![npm version](https://badge.fury.io/js/%40curl-runner%2Fcore.svg)](https://badge.fury.io/js/%40curl-runner%2Fcore)
[![Node.js Version](https://img.shields.io/node/v/@curl-runner/core)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Core library for running cURL scripts with comprehensive logging and error handling. This library provides the essential functionality for executing cURL scripts, parsing output, and managing logs without CLI dependencies.

## 🚀 Features

- **🔄 cURL Script Execution** - Run individual or batch cURL scripts
- **📊 Weekly Data Gap Analysis** - Comprehensive reporting over configurable weeks (default: 52)
- **🔍 Data Gap Detection** - Automatic identification of missing data and performance issues
- **📈 Trend Analysis** - Track success rates, error patterns, and performance trends over time
- **📊 Comprehensive Logging** - Detailed logs with timestamps and status tracking
- **🚨 Error Handling** - HTTP error detection and categorization
- **📁 File Management** - Script discovery and file system utilities
- **⚡ High Performance** - Optimized for batch processing
- **🔧 Modular Design** - Use individual components or the full suite
- **📝 TypeScript Support** - Full type definitions included
- **🔒 Zero Dependencies** - No external dependencies for maximum security

## 📦 Installation

```bash
npm install @curl-runner/core
```

## 📋 Requirements

- **Node.js**: >=18.0.0 (ES modules and built-in test runner)
  - **Tested**: v22.18.0 (current)
  - **Compatible**: v18.0.0 - v24.x.x
  - **Recommended**: v22.x.x - v24.x.x for best performance
- **Operating Systems**: macOS, Linux, Windows
- **Dependencies**: Zero external dependencies (maximum security)

### 🔒 **Automatic Compatibility Enforcement**

The library automatically enforces Node.js version compatibility when imported:

- **✅ Supported Versions**: v18.0.0+ (library loads normally)
- **⚠️ Unsupported Versions**: <v18.0.0 (throws clear error with upgrade instructions)
- **📢 Warnings**: Non-recommended versions show helpful warnings
- **🔧 Programmatic Access**: Check compatibility status in your code

## 🎯 Quick Start

### Basic Usage

```javascript
import { CurlRunner } from '@curl-runner/core';

// Create a new runner instance
const runner = new CurlRunner({
  scriptsDir: './scripts',
  logsDir: './logs'
});

// Run all scripts in the directory
const results = await runner.runAllScripts();
console.log(`Executed ${results.length} scripts`);

// Run a specific script
const result = await runner.runScript('example-get.sh');
console.log('Script result:', result);
```

### Individual Components

```javascript
import { Logger, CurlParser, FileSystem } from '@curl-runner/core';

// Use the logger
const logger = new Logger('./logs');
await logger.writeLog('script-name', 'Log content here');

// Parse cURL output
const parser = new CurlParser();
const parsed = parser.parseCurlOutput(curlOutput);

// File system operations
const fs = new FileSystem();
const scripts = await fs.scanScripts('./scripts');
```

### Compatibility Checking

```javascript
import { 
  getCompatibilityInfo, 
  isTestedVersion, 
  isRecommendedVersion,
  getCompatibilityMatrix 
} from '@curl-runner/core';

// Check compatibility status
const info = getCompatibilityInfo();
console.log(`Node.js ${info.currentVersion} is ${info.isSupported ? 'supported' : 'not supported'}`);

// Check specific version ranges
if (isTestedVersion()) {
  console.log('Using a tested Node.js version');
}

if (isRecommendedVersion()) {
  console.log('Using a recommended Node.js version');
}

// Get full compatibility matrix
const matrix = getCompatibilityMatrix();
console.log('Compatibility matrix:', matrix);
```

## 📊 Weekly Data Gap Analysis

The library includes powerful weekly reporting capabilities for data gap analysis and trend tracking.

### Weekly Reporting Configuration

```javascript
import { CurlRunner, DEFAULT_CONFIG } from '@curl-runner/core';

// Initialize with weekly reporting (default: 52 weeks)
const runner = new CurlRunner(
  './scripts',           // Scripts directory
  './logs',              // Logs directory
  './reports',           // Reports directory
  52                     // Number of weeks to analyze
);

// Get configuration
const config = runner.getWeeklyReportingConfig();
console.log(`Weeks: ${config.weeks}`);
console.log(`Success Rate Threshold: ${config.dataGapAnalysis.SUCCESS_RATE_THRESHOLD * 100}%`);
```

### Single Week Analysis

```javascript
// Run analysis for a specific week
const weekResult = await runner.runWeeklyAnalysis(1);

console.log(`Week ${weekResult.weekNumber} Results:`);
console.log(`Success Rate: ${(weekResult.report.summary.overallSuccessRate * 100).toFixed(1)}%`);
console.log(`Data Gaps: ${weekResult.report.summary.dataGapsCount}`);
console.log(`Alerts: ${weekResult.report.summary.alertsCount}`);
console.log(`Report: ${weekResult.reportPath}`);
```

### Multi-Week Analysis

```javascript
// Run analysis for all configured weeks
const multiWeekResult = await runner.runMultiWeekAnalysis();

if (multiWeekResult) {
  console.log(`Multi-Week Summary:`);
  console.log(`Total Weeks: ${multiWeekResult.summaryReport.metadata.totalWeeks}`);
  console.log(`Average Success Rate: ${(multiWeekResult.summaryReport.overallMetrics.averageSuccessRate * 100).toFixed(1)}%`);
  console.log(`Total Data Gaps: ${multiWeekResult.summaryReport.overallMetrics.totalDataGaps}`);
  console.log(`Success Trend: ${multiWeekResult.summaryReport.trends.successRateTrend}`);
  console.log(`Summary Report: ${multiWeekResult.summaryPath}`);
}
```

### Direct WeeklyReporter Usage

```javascript
import { WeeklyReporter } from '@curl-runner/core';

const reporter = new WeeklyReporter('./reports', 52);

// Analyze week data
const weekData = {
  week: 1,
  scripts: [
    {
      name: 'api-test.sh',
      results: [
        { success: true, output: 'Success', httpStatus: 200, duration: 150 },
        { success: false, output: 'Error', httpStatus: 500, duration: 200 }
      ]
    }
  ]
};

const analysis = reporter.analyzeDataGaps(weekData);
console.log(`Success Rate: ${(analysis.overallSuccessRate * 100).toFixed(1)}%`);
console.log(`Data Gaps: ${analysis.dataGaps.length}`);
console.log(`Alerts: ${analysis.alerts.length}`);

// Generate and save report
const report = reporter.generateWeeklyReport(weekData);
const reportPath = await reporter.saveWeeklyReport(report);
```

### Report Structure

Weekly reports include:

- **Metadata**: Generation timestamp, week number, version
- **Summary**: Overall metrics and counts
- **Analysis**: Detailed data gap analysis with severity levels
- **Recommendations**: Actionable insights based on analysis
- **Trends**: Performance trends over time

### Data Gap Detection

The library automatically detects:

- **Critical Gaps**: Success rate < 50%
- **High Priority Gaps**: Success rate < 80%
- **Medium Gaps**: Success rate < 95%
- **Error Rate Alerts**: Error rate > 5%
- **Overall Performance**: System-wide issues

## 📚 API Reference

### CurlRunner

The main class for running cURL scripts.

#### Constructor

```javascript
new CurlRunner(scriptsDir?, logsDir?, reportsDir?, weeks?)
```

**Parameters:**
- `scriptsDir` (string, optional): Directory containing .sh files (default: './scripts')
- `logsDir` (string, optional): Directory for log files (default: './var/logs')
- `reportsDir` (string, optional): Directory for weekly reports (default: './var/reports')
- `weeks` (number, optional): Number of weeks for analysis (default: 52)

#### Methods

##### `runAllScripts(): Promise<CurlResult[]>`
Runs all scripts in the scripts directory.

##### `runScript(scriptName: string): Promise<CurlResult>`
Runs a specific script by name.

##### `scanScripts(): Promise<ScriptInfo[]>`
Scans the scripts directory and returns available scripts.

##### `runWeeklyAnalysis(weekNumber?: number): Promise<WeeklyAnalysisResult>`
Runs data gap analysis for a specific week and generates a weekly report.

##### `runMultiWeekAnalysis(): Promise<MultiWeekAnalysisResult>`
Runs data gap analysis for all configured weeks and generates summary reports.

##### `getWeeklyReportingConfig(): WeeklyReportingConfig`
Returns the current weekly reporting configuration.

### WeeklyReporter

Handles weekly data gap analysis and report generation.

#### Constructor

```javascript
new WeeklyReporter(reportsDir?, weeks?)
```

**Parameters:**
- `reportsDir` (string, optional): Directory for reports (default: './var/reports')
- `weeks` (number, optional): Number of weeks for analysis (default: 52)

#### Methods

##### `analyzeDataGaps(weekData: WeeklyReportData): DataGapAnalysis`
Analyzes data gaps for a specific week's data.

##### `generateWeeklyReport(weekData: WeeklyReportData): WeeklyReport`
Generates a comprehensive weekly report.

##### `generateSummaryReport(weeklyReports: WeeklyReport[]): SummaryReport`
Generates a summary report for multiple weeks.

##### `saveWeeklyReport(report: WeeklyReport): Promise<string>`
Saves a weekly report to file and returns the file path.

##### `saveSummaryReport(summary: SummaryReport): Promise<string>`
Saves a summary report to file and returns the file path.

### Logger

Handles all logging operations.

#### Methods

##### `writeLog(scriptName: string, content: string): Promise<void>`
Writes a log entry for a specific script.

##### `writeReportLog(message: string): Promise<void>`
Writes to the report log.

##### `writeErrorLog(error: string): Promise<void>`
Writes to the error log.

### CurlParser

Parses cURL output and extracts useful information.

#### Methods

##### `parseCurlOutput(output: string): CurlResult`
Parses raw cURL output into a structured result.

##### `extractHttpStatus(output: string): number | null`
Extracts HTTP status code from cURL output.

##### `isHttpError(status: number): boolean`
Checks if an HTTP status code represents an error.

### FileSystem

Handles file system operations.

#### Methods

##### `scanScripts(directory: string): Promise<ScriptInfo[]>`
Scans a directory for script files.

##### `fileExists(filePath: string): Promise<boolean>`
Checks if a file exists.

## 🔧 Configuration

### Default Configuration

```javascript
import { DEFAULT_CONFIG } from '@curl-runner/core';

console.log(DEFAULT_CONFIG);
// {
//   SCRIPTS_DIR: './scripts',
//   LOGS_DIR: './var/logs',
//   REPORT_LOG_FILE: 'curl-runner-report.log',
//   ERROR_LOG_FILE: 'curl-api-errors.log',
//   SCRIPT_EXTENSION: '.sh',
//   SCRIPT_DELAY_MS: 1000
// }
```

## 📊 Logging

The library provides comprehensive logging:

- **Individual Script Logs**: `{script-name}_{timestamp}.log`
- **Report Log**: High-level summary of all executions
- **Error Log**: Dedicated log for HTTP errors and failures

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "script": "example-get.sh",
  "status": "success",
  "duration": 1850,
  "httpStatus": 200,
  "output": "..."
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 TypeScript Support

Full TypeScript definitions are included:

```typescript
import { CurlRunner, CurlResult, LoggerConfig } from '@curl-runner/core';

const runner: CurlRunner = new CurlRunner();
const result: CurlResult = await runner.runScript('test.sh');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [curl-runner-cli](https://github.com/Grant-Steinfeld/cURL_runner) - CLI application using this library
- [curl-runner-web](https://github.com/Grant-Steinfeld/cURL_runner-web) - Web interface (coming soon)

## 📞 Support

- 📧 Email: support@curl-runner.dev
- 🐛 Issues: [GitHub Issues](https://github.com/Grant-Steinfeld/cURL_runner/issues)
- 📖 Documentation: [Full Documentation](https://curl-runner.dev/docs)