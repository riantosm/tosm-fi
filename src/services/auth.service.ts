import i18n from "@/helpers/i18n";
import type { AuthUser, LoginCredentials } from "@/types/auth.types";

const FAKE_LATENCY_MS = 700;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay();

    if (!credentials.username || !credentials.password) {
      throw new Error(i18n.t("auth.credentialsRequired"));
    }

    return {
      idUser: "user-1",
      nameUser: credentials.username,
      username: credentials.username,
      netWorth: 0,
    };
  },

  async getUser(current: AuthUser): Promise<AuthUser> {
    await delay();
    return { ...current, netWorth: 0 };
  },
};
