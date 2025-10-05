import { setupCommands } from './commands.js';
import { CurlRunner } from '../lib/CurlRunner.js';

/**
 * Handle CLI execution
 */
export function handleCLI() {
  const program = setupCommands();

  // Default action when no command is provided
  if (process.argv.length === 2) {
    const runner = new CurlRunner('./scripts', './var/logs');
    runner.runAllScripts();
  } else {
    program.parse();
  }
}