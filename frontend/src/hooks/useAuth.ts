import { create } from "zustand";
import type { AuthState, RegisterRequest } from "../types/auth";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: storage.getToken(),
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const tokenData = await authService.login(email, password);
    storage.setToken(tokenData.access_token);

    const user = await authService.getCurrentUser();

    set({
      user,
      token: tokenData.access_token,
      isAuthenticated: true,
    });
  },

  register: async (data: RegisterRequest) => {
    const user = await authService.register(data);

    // After registration, log in automatically
    const tokenData = await authService.login(data.email, data.password);
    storage.setToken(tokenData.access_token);

    set({
      user,
      token: tokenData.access_token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    storage.removeToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const token = storage.getToken();
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      storage.removeToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },
}));
