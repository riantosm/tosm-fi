import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { AuthUser, LoginCredentials, RegisterInput } from "@/types/auth.types";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthUser> {
    try {
      const { data } = await httpClient.post("/auth/register", input);
      return data.data as AuthUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("auth.genericError")));
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await httpClient.post("/auth/login", {
        username: credentials.username,
        password: credentials.password,
      });
      return data.data as LoginResponse;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("auth.genericError")));
    }
  },

  async getMe(token: string): Promise<AuthUser> {
    try {
      const { data } = await httpClient.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data as AuthUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("auth.genericError")));
    }
  },

  async logout(): Promise<void> {
    // Relies on http-client's request interceptor to attach the current
    // token — must be called before the caller clears it from Redux.
    await httpClient.post("/auth/logout");
  },
};
