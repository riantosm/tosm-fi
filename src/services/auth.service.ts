import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  AuthUser,
  ChangePasswordInput,
  LoginCredentials,
  RegisterInput,
  UpdateProfileInput,
} from "@/types/auth.types";

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
      throw new Error(getApiErrorMessage(error, i18n.t("auth.genericError")), { cause: error });
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
      throw new Error(getApiErrorMessage(error, i18n.t("auth.genericError")), { cause: error });
    }
  },

  async getMe(token: string): Promise<AuthUser> {
    try {
      const { data } = await httpClient.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data as AuthUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("auth.genericError")), { cause: error });
    }
  },

  async logout(): Promise<void> {
    // Relies on http-client's request interceptor to attach the current
    // token — must be called before the caller clears it from Redux.
    await httpClient.post("/auth/logout");
  },

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    try {
      const { data } = await httpClient.patch("/user/me", input);
      return data.data as AuthUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("profile.genericError")), { cause: error });
    }
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    try {
      await httpClient.patch("/user/me/password", input);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("profile.genericError")), { cause: error });
    }
  },
};
