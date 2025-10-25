import { Command } from 'commander';
import { CurlRunner } from '../lib/CurlRunner.js';

/**
 * Setup CLI commands using Commander.js
 */
export function setupCommands() {
  const program = new Command();

  program
    .name('curl-runner')
    .description('Run cURL scripts from .sh files')
    .version('1.0.0');

  program
    .command('run')
    .description('Run all .sh files in the scripts directory')
    .option('-d, --dir <directory>', 'Scripts directory', './cURL_scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action(async (options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      await runner.runAllScripts();
    });

  program
    .command('run-script <script>')
    .description('Run a specific .sh file')
    .option('-d, --dir <directory>', 'Scripts directory', './cURL_scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action(async (script, options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      await runner.runSpecificScript(script);
    });

  program
    .command('run-parallel')
    .description('Run all .sh files in parallel (unlimited concurrency)')
    .option('-d, --dir <directory>', 'Scripts directory', './cURL_scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action(async (options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      await runner.runAllScriptsParallel();
    });

  program
    .command('run-concurrent')
    .description('Run all .sh files with controlled concurrency (batched parallel execution)')
    .option('-d, --dir <directory>', 'Scripts directory', './cURL_scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .option('-b, --batch-size <size>', 'Batch size for concurrent execution', '5')
    .option('--delay <ms>', 'Delay between batches in milliseconds', '200')
    .action(async (options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      const concurrentOptions = {
        batchSize: parseInt(options.batchSize),
        delayBetweenBatches: parseInt(options.delay)
      };
      await runner.runAllScriptsConcurrent(concurrentOptions);
    });

  program
    .command('run-concurrency <max>')
    .description('Run all .sh files with custom concurrency control')
    .option('-d, --dir <directory>', 'Scripts directory', './cURL_scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action(async (maxConcurrent, options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      const scripts = runner.scanScripts();
      await runner.runScriptsWithConcurrency(scripts, parseInt(maxConcurrent));
    });

  program
    .command('list')
    .description('List all available .sh files')
    .option('-d, --dir <directory>', 'Scripts directory', './cURL_scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action((options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      runner.listScripts();
    });

  return program;
}