/**
 * Utilidad de registro de color para el frontend.
 * Utiliza estilos CSS para colorear los mensajes de la consola.
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
 * Registra un mensaje de éxito en verde.
 */
export const logSuccess = (message: string, ...args: any[]) => {
  console.log(`%c${symbols.success} ${message}`, styles.success, ...args);
};

/**
 * Registra un mensaje de error en rojo.
 */
export const logError = (message: string, ...args: any[]) => {
  console.error(`%c${symbols.error} ${message}`, styles.error, ...args);
};

/**
 * Registra un mensaje de advertencia en amarillo.
 */
export const logWarning = (message: string, ...args: any[]) => {
  console.warn(`%c${symbols.warning} ${message}`, styles.warning, ...args);
};

/**
 * Registra un mensaje de información en azul.
 */
export const logInfo = (message: string, ...args: any[]) => {
  console.info(`%c${symbols.info} ${message}`, styles.info, ...args);
};

/**
 * Registra una solicitud HTTP.
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
 * Registra una respuesta HTTP con el color apropiado según el estado.
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
    // Éxito - Verde
    style = styles.success;
    symbol = symbols.success;
  } else if (status >= 300 && status < 400) {
    // Redirección - Información
    style = styles.info;
    symbol = symbols.info;
  } else if (status >= 400 && status < 500) {
    // Error del cliente - Advertencia
    style = styles.warning;
    symbol = symbols.warning;
  } else {
    // Error del servidor - Error
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
 * Registrar un error HTTP.
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
 * Cree una instancia de registrador para un módulo específico.
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
