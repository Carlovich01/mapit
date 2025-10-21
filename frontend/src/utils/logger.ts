/**
 * Colored logging utility for the frontend.
 * Uses CSS styling to color console messages.
 */

interface LogStyles {
  success: string;
  error: string;
  warning: string;
  info: string;
}

const styles: LogStyles = {
  success: "color: #10b981; font-weight: bold; font-size: 12px;",
  error: "color: #ef4444; font-weight: bold; font-size: 12px;",
  warning: "color: #f59e0b; font-weight: bold; font-size: 12px;",
  info: "color: #3b82f6; font-weight: bold; font-size: 12px;",
};

const symbols = {
  success: "✓",
  error: "✗",
  warning: "⚠",
  info: "ℹ",
};

/**
 * Log a success message in green.
 */
export const logSuccess = (message: string, ...args: any[]) => {
  console.log(`%c${symbols.success} ${message}`, styles.success, ...args);
};

/**
 * Log an error message in red.
 */
export const logError = (message: string, ...args: any[]) => {
  console.error(`%c${symbols.error} ${message}`, styles.error, ...args);
};

/**
 * Log a warning message in yellow.
 */
export const logWarning = (message: string, ...args: any[]) => {
  console.warn(`%c${symbols.warning} ${message}`, styles.warning, ...args);
};

/**
 * Log an info message in blue.
 */
export const logInfo = (message: string, ...args: any[]) => {
  console.info(`%c${symbols.info} ${message}`, styles.info, ...args);
};

/**
 * Log an HTTP request.
 */
export const logRequest = (method: string, url: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `%c→ [${timestamp}] ${method} ${url}`,
    "color: #6366f1; font-weight: bold;",
    data || ""
  );
};

/**
 * Log an HTTP response with appropriate color based on status.
 */
export const logResponse = (
  method: string,
  url: string,
  status: number,
  duration?: number
) => {
  const timestamp = new Date().toLocaleTimeString();
  let style: string;
  let symbol: string;

  if (status >= 200 && status < 300) {
    // Success - Green
    style = styles.success;
    symbol = symbols.success;
  } else if (status >= 300 && status < 400) {
    // Redirect - Info
    style = styles.info;
    symbol = symbols.info;
  } else if (status >= 400 && status < 500) {
    // Client error - Warning
    style = styles.warning;
    symbol = symbols.warning;
  } else {
    // Server error - Error
    style = styles.error;
    symbol = symbols.error;
  }

  const durationText = duration ? ` (${duration.toFixed(0)}ms)` : "";
  console.log(
    `%c${symbol} [${timestamp}] ${method} ${url} - Status: ${status}${durationText}`,
    style
  );
};

/**
 * Log an HTTP error.
 */
export const logHttpError = (
  method: string,
  url: string,
  error: any,
  duration?: number
) => {
  const timestamp = new Date().toLocaleTimeString();
  const durationText = duration ? ` (${duration.toFixed(0)}ms)` : "";

  console.group(
    `%c${symbols.error} [${timestamp}] ${method} ${url} - ERROR${durationText}`,
    styles.error
  );
  console.error("Error details:", error);
  if (error.response) {
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
    console.error("Response headers:", error.response.headers);
  }
  console.groupEnd();
};

/**
 * Create a logger instance for a specific module.
 */
export const createLogger = (moduleName: string) => ({
  success: (message: string, ...args: any[]) =>
    logSuccess(`[${moduleName}] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    logError(`[${moduleName}] ${message}`, ...args),
  warning: (message: string, ...args: any[]) =>
    logWarning(`[${moduleName}] ${message}`, ...args),
  info: (message: string, ...args: any[]) =>
    logInfo(`[${moduleName}] ${message}`, ...args),
});

export default {
  success: logSuccess,
  error: logError,
  warning: logWarning,
  info: logInfo,
  request: logRequest,
  response: logResponse,
  httpError: logHttpError,
  create: createLogger,
};
