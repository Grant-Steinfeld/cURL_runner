import { CurlRunner } from '../lib/CurlRunner.js';
import { parseArgs, showHelp, showVersion, validateArgs } from './parser.js';

/**
 * Execute CLI commands using native argument parsing
 */
export function executeCLI() {
  const parsed = parseArgs();

  // Handle help and version flags
  if (parsed.options.help) {
    showHelp();
    return;
  }

  if (parsed.options.version) {
    showVersion();
    return;
  }

  // Validate arguments
  validateArgs(parsed);

  // Set defaults
  const options = {
    dir: parsed.options.dir || './cURL_scripts',
    logs: parsed.options.logs || './var/logs',
    batchSize: parsed.options.batchSize || '5',
    delay: parsed.options.delay || '200'
  };

  const runner = new CurlRunner(options.dir, options.logs);

  // Execute command
  switch (parsed.command) {
    case 'run':
    case null: // Default command
      runner.runAllScripts();
      break;

    case 'run-script':
      const scriptName = parsed.positional[0];
      runner.runScript(scriptName);
      break;

    case 'run-parallel':
      runner.runAllScriptsParallel();
      break;

    case 'run-concurrent':
      const concurrentOptions = {
        batchSize: parseInt(options.batchSize),
        delayBetweenBatches: parseInt(options.delay)
      };
      runner.runAllScriptsConcurrent(concurrentOptions);
      break;

    case 'run-concurrency':
      const maxConcurrent = parseInt(parsed.positional[0]);
      const scripts = runner.scanScripts();
      runner.runScriptsWithConcurrency(scripts, maxConcurrent);
      break;

    case 'list':
      const availableScripts = runner.scanScripts();
      if (availableScripts.length === 0) {
        console.log('No .sh files found in the scripts directory.');
      } else {
        console.log('Available scripts:');
        availableScripts.forEach((script, index) => {
          console.log(`  ${index + 1}. ${script}`);
        });
      }
      break;

    default:
      console.error(`Unknown command: ${parsed.command}`);
      showHelp();
      process.exit(1);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use executeCLI() instead
 */
export function setupCommands() {
  console.warn('setupCommands() is deprecated. Use executeCLI() instead.');
  return executeCLI();
}