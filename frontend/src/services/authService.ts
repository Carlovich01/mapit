import api from "./api";
import type {
  User,
  AuthToken,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export const authService = {
  async login(email: string, password: string): Promise<AuthToken> {
    // OAuth2 password flow expects form data
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
