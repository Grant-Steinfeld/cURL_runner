import { describe, it } from 'node:test';
import assert from 'node:assert';

import { CurlParser } from '../../../src/utils/parser.js';

describe('CurlParser', () => {
  it('parses HTTP status from stdout', () => {
    const result = CurlParser.parseCurlOutput('HTTP Status: 204', '');
    assert.strictEqual(result.httpStatus, 204);
    assert.strictEqual(result.isApiError, false);
    assert.strictEqual(result.errorMessage, null);
  });

  it('prefers stderr as error message', () => {
    const result = CurlParser.parseCurlOutput('HTTP Status: 500', 'upstream error');
    assert.strictEqual(result.httpStatus, 500);
    assert.strictEqual(result.isApiError, true);
    assert.strictEqual(result.errorMessage, 'upstream error');
  });

  it('extracts status from various formats', () => {
    const samples = [
      'Status: 201',
      'HTTP/1.1 418 I\'m a teapot',
      'HTTPSTATUS:451'
    ];
    const expected = [201, 418, 451];

    samples.forEach((sample, index) => {
      assert.strictEqual(CurlParser.extractHttpStatus(sample), expected[index]);
    });
  });

  it('detects HTTP error statuses', () => {
    assert.strictEqual(CurlParser.isHttpError(200), false);
    assert.strictEqual(CurlParser.isHttpError(404), true);
    assert.ok(!CurlParser.isHttpError(null));
  });

  it('categorises status codes', () => {
    assert.strictEqual(CurlParser.getErrorCategory(503), 'server_error');
    assert.strictEqual(CurlParser.getErrorCategory(429), 'client_error');
    assert.strictEqual(CurlParser.getErrorCategory(302), 'redirection');
    assert.strictEqual(CurlParser.getErrorCategory(204), 'success');
    assert.strictEqual(CurlParser.getErrorCategory(null), 'unknown');
  });
});

