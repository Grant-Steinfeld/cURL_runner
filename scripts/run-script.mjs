import { runScript } from '../index.js';
import { getRunnerOptions, exitOnError } from './shared-options.mjs';

const scriptName = process.argv[2] ?? process.env.CURL_RUNNER_SCRIPT;

if (!scriptName) {
  console.error('Usage: node scripts/run-script.mjs <script-name>');
  console.error('Hint: you can also set CURL_RUNNER_SCRIPT to provide the name.');
  process.exit(1);
}

const options = getRunnerOptions();

try {
  await runScript(scriptName, options);
} catch (error) {
  exitOnError(error);
}

