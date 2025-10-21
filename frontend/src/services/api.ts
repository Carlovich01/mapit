import axios from "axios";
import { storage } from "../utils/storage";
import logger from "../utils/logger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token and log requests
api.interceptors.request.use(
  (config) => {
    // Add timestamp for duration calculation
    config.metadata = { startTime: new Date().getTime() };

    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request
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

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Calculate duration
    const duration =
      new Date().getTime() - (response.config.metadata?.startTime || 0);

    // Log successful response
    const method = response.config.method?.toUpperCase() || "GET";
    const url = response.config.url || "";
    const status = response.status;

    logger.response(method, url, status, duration);

    return response;
  },
  (error) => {
    // Calculate duration
    const duration = error.config?.metadata?.startTime
      ? new Date().getTime() - error.config.metadata.startTime
      : undefined;

    // Log the error
    const method = error.config?.method?.toUpperCase() || "UNKNOWN";
    const url = error.config?.url || "unknown";

    logger.httpError(method, url, error, duration);

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Token expired or invalid
      storage.removeToken();
      logger.warning("Sesión expirada - Redirigiendo al login");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Extend axios config type to include metadata
declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export default api;
