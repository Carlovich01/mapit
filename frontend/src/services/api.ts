import axios from "axios";
import { storage } from "../utils/storage";
import logger from "../utils/logger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitudes para agregar tokens JWT y registrar solicitudes
api.interceptors.request.use(
  (config) => {
    // Agregar marca de tiempo para el cálculo de duración
    config.metadata = { startTime: new Date().getTime() };

    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Registrar la solicitud
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    logger.request(method, url, config.data);

    return config;
  },
  (error) => {
    logger.error("Error en la petición:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para el manejo y registro de errores
api.interceptors.response.use(
  (response) => {
    // Calcular duración
    const duration =
      new Date().getTime() - (response.config.metadata?.startTime || 0);

    // Registrar respuesta exitosa
    const method = response.config.method?.toUpperCase() || "GET";
    const url = response.config.url || "";
    const status = response.status;

    logger.response(method, url, status, duration);

    return response;
  },
  (error) => {
    // Calcular duración
    const duration = error.config?.metadata?.startTime
      ? new Date().getTime() - error.config.metadata.startTime
      : undefined;

    // Registrar el error
    const method = error.config?.method?.toUpperCase() || "UNKNOWN";
    const url = error.config?.url || "unknown";

    logger.httpError(method, url, error, duration);

    // Manejar errores 401 (no autorizados)
    if (error.response?.status === 401) {
      // Token caducado o inválido
      storage.removeToken();
      logger.warning("Sesión expirada - Redirigiendo al login");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Ampliar el tipo de configuración de axios para incluir metadatos
declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export default api;
