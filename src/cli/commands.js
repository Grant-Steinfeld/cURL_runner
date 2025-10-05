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
    .option('-d, --dir <directory>', 'Scripts directory', './scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action(async (options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      await runner.runAllScripts();
    });

  program
    .command('run-script <script>')
    .description('Run a specific .sh file')
    .option('-d, --dir <directory>', 'Scripts directory', './scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action(async (script, options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      await runner.runSpecificScript(script);
    });

  program
    .command('list')
    .description('List all available .sh files')
    .option('-d, --dir <directory>', 'Scripts directory', './scripts')
    .option('-l, --logs <directory>', 'Logs directory', './var/logs')
    .action((options) => {
      const runner = new CurlRunner(options.dir, options.logs);
      runner.listScripts();
    });

  return program;
}