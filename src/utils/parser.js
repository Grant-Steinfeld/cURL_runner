/**
 * Utility functions for parsing cURL output
 */
export class CurlParser {
  /**
   * Parse cURL output to extract HTTP status and error information
   */
  static parseCurlOutput(stdout, stderr) {
    const httpStatusMatch = stdout.match(/HTTP Status: (\d+)/);
    const httpStatus = httpStatusMatch ? parseInt(httpStatusMatch[1]) : null;
    
    // Check for common API error patterns
    const isApiError = httpStatus && (httpStatus >= 400);
    const errorMessage = stderr || (isApiError ? `HTTP ${httpStatus} error` : null);
    
    return { httpStatus, isApiError, errorMessage };
  }

  /**
   * Extract HTTP status from various cURL output formats
   */
  static extractHttpStatus(output) {
    const patterns = [
      /HTTP Status: (\d+)/,
      /HTTP\/\d\.\d (\d+)/,
      /HTTPSTATUS:(\d+)/,
      /Status: (\d+)/
    ];

    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return null;
  }

  /**
   * Check if HTTP status indicates an error
   */
  static isHttpError(status) {
    return status && status >= 400;
  }

  /**
   * Get error category from HTTP status
   */
  static getErrorCategory(status) {
    if (!status) return 'unknown';
    if (status >= 500) return 'server_error';
    if (status >= 400) return 'client_error';
    if (status >= 300) return 'redirection';
    if (status >= 200) return 'success';
    return 'unknown';
  }
}