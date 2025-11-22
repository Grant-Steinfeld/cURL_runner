import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { CurlRunner } from '../../../src/lib/CurlRunner.js';

const TMP_PREFIX = 'curl-runner-tests-';

function makeExecutableScript(filePath, contents) {
  fs.writeFileSync(filePath, contents, { mode: 0o755 });
  fs.chmodSync(filePath, 0o755);
}

describe('CurlRunner (integration with filesystem)', () => {
  let tempRoot;
  let scriptsDir;
  let logsDir;
  let runner;

  before(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), TMP_PREFIX));
    scriptsDir = path.join(tempRoot, 'scripts');
    logsDir = path.join(tempRoot, 'logs');

    fs.mkdirSync(scriptsDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    makeExecutableScript(
      path.join(scriptsDir, 'ok.sh'),
      '#!/usr/bin/env bash\n' +
        'echo "hello world"\n' +
        'echo "HTTP Status: 200"\n'
    );

    makeExecutableScript(
      path.join(scriptsDir, 'api-error.sh'),
      '#!/usr/bin/env bash\n' +
        'echo "HTTP Status: 404"\n'
    );

    runner = new CurlRunner(scriptsDir, logsDir);
  });

  after(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('lists available scripts', () => {
    const scripts = runner.listScripts();
    assert.deepStrictEqual(scripts.sort(), ['api-error.sh', 'ok.sh']);
  });

  it('runs a script successfully', async () => {
    const result = await runner.runScript('ok.sh');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.httpStatus, 200);
    assert.ok(result.output.includes('hello world'));
  });

  it('detects API errors', async () => {
    const result = await runner.runScript('api-error.sh');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.httpStatus, 404);
    assert.match(result.error, /HTTP 404/);
  });

  it('returns an informative object when script is missing', async () => {
    const result = await runner.runScript('missing.sh');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.httpStatus, null);
    assert.match(result.error, /not found/);
  });

  it('runs all scripts sequentially', async () => {
    const results = await runner.runAllScripts();
    assert.strictEqual(results.length, 2);
    const successCount = results.filter(r => r.success).length;
    assert.strictEqual(successCount, 1);
  });
});

