import { runAllScriptsConcurrent } from '../index.js';
import { getRunnerOptions, parseInteger, exitOnError } from './shared-options.mjs';

const batchArg = process.argv[2] ?? process.env.CURL_RUNNER_BATCH_SIZE;
const delayArg = process.argv[3] ?? process.env.CURL_RUNNER_DELAY;

const options = getRunnerOptions();

try {
  if (batchArg !== undefined && batchArg !== null) {
    options.batchSize = parseInteger(batchArg);
  }

  if (delayArg !== undefined && delayArg !== null) {
    options.delayBetweenBatches = parseInteger(delayArg);
  }

  await runAllScriptsConcurrent(options);
} catch (error) {
  exitOnError(error);
}

