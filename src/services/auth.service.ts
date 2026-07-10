import i18n from "@/helpers/i18n";
import type { AuthUser, LoginCredentials } from "@/types/auth.types";

const FAKE_LATENCY_MS = 700;

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));

    if (!credentials.username || !credentials.password) {
      throw new Error(i18n.t("auth.credentialsRequired"));
    }

    return {
      id: "user-1",
      name: credentials.username,
      username: credentials.username,
    };
  },
};
