import api from "./api";
import type {
  User,
  AuthToken,
  RegisterRequest,
} from "../types/auth";

export const authService = {
  async login(email: string, password: string): Promise<AuthToken> {
    // El flujo de contraseñas de OAuth2 espera datos de formulario
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post<AuthToken>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<User>("/auth/register", data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};
