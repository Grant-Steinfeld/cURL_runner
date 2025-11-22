import { runAllScripts } from '../index.js';
import { getRunnerOptions, exitOnError } from './shared-options.mjs';

const options = getRunnerOptions();

try {
  await runAllScripts(options);
} catch (error) {
  exitOnError(error);
}

