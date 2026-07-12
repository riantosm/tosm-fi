import { LANG_STORAGE_KEY } from "@/constants/storage-keys";
import type { SettingsInput, UserSettings } from "@/types/settings.types";

const FAKE_LATENCY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
}

export const settingsService = {
  async fetchSettings(current: UserSettings): Promise<UserSettings> {
    await delay();
    return current;
  },

  async updateSettings(input: SettingsInput, current: UserSettings): Promise<UserSettings> {
    await delay();
    const updated: UserSettings = { ...current, ...input };
    if (input.language) {
      // i18n boots before Redux rehydrates, so it reads this key directly.
      localStorage.setItem(LANG_STORAGE_KEY, updated.language);
    }
    return updated;
  },
};
