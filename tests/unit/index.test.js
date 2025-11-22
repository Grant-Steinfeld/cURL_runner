import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  createRunner,
  listScripts,
  runScript,
  runAllScripts
} from '../../index.js';

const TMP_PREFIX = 'curl-runner-index-tests-';

describe('Public index exports', () => {
  let tempRoot;
  let scriptsDir;
  let logsDir;

  before(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), TMP_PREFIX));
    scriptsDir = path.join(tempRoot, 'scripts');
    logsDir = path.join(tempRoot, 'logs');

    fs.mkdirSync(scriptsDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    const scriptPath = path.join(scriptsDir, 'hello.sh');
    fs.writeFileSync(
      scriptPath,
      '#!/usr/bin/env bash\n' +
        'echo "HTTP Status: 200"\n' +
        'echo "hello from public api"\n',
      { mode: 0o755 }
    );
    fs.chmodSync(scriptPath, 0o755);
  });

  after(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('creates a runner with overridden directories', () => {
    const runner = createRunner({ scriptsDir, logsDir });
    assert.strictEqual(runner.scriptsDir, scriptsDir);
    assert.strictEqual(runner.logsDir, logsDir);
  });

  it('lists scripts via helper', () => {
    const scripts = listScripts({ scriptsDir });
    assert.deepStrictEqual(scripts, ['hello.sh']);
  });

  it('runs a single script through the facade', async () => {
    const result = await runScript('hello.sh', { scriptsDir, logsDir });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.httpStatus, 200);
  });

  it('runs all scripts via helper', async () => {
    const results = await runAllScripts({ scriptsDir, logsDir });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].success, true);
  });
});

