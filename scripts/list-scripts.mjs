import { listScripts } from '../index.js';
import { getRunnerOptions, exitOnError } from './shared-options.mjs';

const options = getRunnerOptions();

try {
  const scripts = listScripts(options);

  if (!scripts || scripts.length === 0) {
    console.log('No .sh files found.');
    process.exit(0);
  }

  console.log('Available scripts:');
  scripts.forEach((script, index) => {
    console.log(`  ${index + 1}. ${script}`);
  });
} catch (error) {
  exitOnError(error);
}

