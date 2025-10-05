import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CurlParser } from '../../../src/utils/parser.js';

describe('CurlParser', () => {
  describe('parseCurlOutput', () => {
    it('should parse HTTP status from output', () => {
      const stdout = 'Some output\nHTTP Status: 200\nMore output';
      const stderr = '';
      
      const result = CurlParser.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 200);
      assert.strictEqual(result.isApiError, false);
      assert.strictEqual(result.errorMessage, null);
    });

    it('should detect API errors for 4xx status codes', () => {
      const stdout = 'Some output\nHTTP Status: 404\nMore output';
      const stderr = '';
      
      const result = CurlParser.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 404);
      assert.strictEqual(result.isApiError, true);
      assert.strictEqual(result.errorMessage, 'HTTP 404 error');
    });

    it('should detect API errors for 5xx status codes', () => {
      const stdout = 'Some output\nHTTP Status: 500\nMore output';
      const stderr = '';
      
      const result = CurlParser.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 500);
      assert.strictEqual(result.isApiError, true);
      assert.strictEqual(result.errorMessage, 'HTTP 500 error');
    });

    it('should use stderr as error message when available', () => {
      const stdout = 'Some output\nHTTP Status: 404\nMore output';
      const stderr = 'Connection timeout';
      
      const result = CurlParser.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, 404);
      assert.strictEqual(result.isApiError, true);
      assert.strictEqual(result.errorMessage, 'Connection timeout');
    });

    it('should handle missing HTTP status', () => {
      const stdout = 'Some output without HTTP status';
      const stderr = '';
      
      const result = CurlParser.parseCurlOutput(stdout, stderr);
      
      assert.strictEqual(result.httpStatus, null);
      assert.strictEqual(result.isApiError, false);
      assert.strictEqual(result.errorMessage, null);
    });
  });

  describe('extractHttpStatus', () => {
    it('should extract HTTP status from various formats', () => {
      const testCases = [
        { output: 'HTTP Status: 200', expected: 200 },
        { output: 'HTTP/1.1 404', expected: 404 },
        { output: 'HTTPSTATUS:500', expected: 500 },
        { output: 'Status: 201', expected: 201 }
      ];

      testCases.forEach(({ output, expected }) => {
        const result = CurlParser.extractHttpStatus(output);
        assert.strictEqual(result, expected);
      });
    });

    it('should return null for unrecognized formats', () => {
      const result = CurlParser.extractHttpStatus('No HTTP status here');
      assert.strictEqual(result, null);
    });
  });

  describe('isHttpError', () => {
    it('should return true for 4xx status codes', () => {
      assert.strictEqual(CurlParser.isHttpError(400), true);
      assert.strictEqual(CurlParser.isHttpError(404), true);
      assert.strictEqual(CurlParser.isHttpError(499), true);
    });

    it('should return true for 5xx status codes', () => {
      assert.strictEqual(CurlParser.isHttpError(500), true);
      assert.strictEqual(CurlParser.isHttpError(503), true);
      assert.strictEqual(CurlParser.isHttpError(599), true);
    });

    it('should return false for 2xx status codes', () => {
      assert.strictEqual(CurlParser.isHttpError(200), false);
      assert.strictEqual(CurlParser.isHttpError(201), false);
      assert.strictEqual(CurlParser.isHttpError(299), false);
    });

    it('should return false for 3xx status codes', () => {
      assert.strictEqual(CurlParser.isHttpError(300), false);
      assert.strictEqual(CurlParser.isHttpError(301), false);
      assert.strictEqual(CurlParser.isHttpError(399), false);
    });

    it('should return false for null or undefined', () => {
      assert.strictEqual(CurlParser.isHttpError(null), false);
      assert.strictEqual(CurlParser.isHttpError(undefined), false);
    });
  });

  describe('getErrorCategory', () => {
    it('should categorize server errors correctly', () => {
      assert.strictEqual(CurlParser.getErrorCategory(500), 'server_error');
      assert.strictEqual(CurlParser.getErrorCategory(503), 'server_error');
      assert.strictEqual(CurlParser.getErrorCategory(599), 'server_error');
    });

    it('should categorize client errors correctly', () => {
      assert.strictEqual(CurlParser.getErrorCategory(400), 'client_error');
      assert.strictEqual(CurlParser.getErrorCategory(404), 'client_error');
      assert.strictEqual(CurlParser.getErrorCategory(499), 'client_error');
    });

    it('should categorize redirections correctly', () => {
      assert.strictEqual(CurlParser.getErrorCategory(300), 'redirection');
      assert.strictEqual(CurlParser.getErrorCategory(301), 'redirection');
      assert.strictEqual(CurlParser.getErrorCategory(399), 'redirection');
    });

    it('should categorize success responses correctly', () => {
      assert.strictEqual(CurlParser.getErrorCategory(200), 'success');
      assert.strictEqual(CurlParser.getErrorCategory(201), 'success');
      assert.strictEqual(CurlParser.getErrorCategory(299), 'success');
    });

    it('should categorize unknown status codes', () => {
      assert.strictEqual(CurlParser.getErrorCategory(100), 'unknown');
      assert.strictEqual(CurlParser.getErrorCategory(600), 'unknown');
      assert.strictEqual(CurlParser.getErrorCategory(null), 'unknown');
      assert.strictEqual(CurlParser.getErrorCategory(undefined), 'unknown');
    });
  });
});