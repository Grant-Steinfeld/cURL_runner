import { runAllScriptsParallel } from '../index.js';
import { getRunnerOptions, exitOnError } from './shared-options.mjs';

const options = getRunnerOptions();

try {
  await runAllScriptsParallel(options);
} catch (error) {
  exitOnError(error);
}

