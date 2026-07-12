import { useCallback } from "react";
import { settingsService } from "@/services/settings.service";
import type { SettingsInput } from "@/types/settings.types";
import { setSettings, setSettingsLoading, useAppDispatch, useAppSelector } from "@/redux";

export function useSettings() {
  const dispatch = useAppDispatch();
  const currency = useAppSelector((state) => state.settings.currency);
  const decimalPlaces = useAppSelector((state) => state.settings.decimalPlaces);
  const language = useAppSelector((state) => state.settings.language);
  const status = useAppSelector((state) => state.settings.status);

  const loadSettings = useCallback(async () => {
    dispatch(setSettingsLoading());
    const data = await settingsService.fetchSettings({ currency, decimalPlaces, language });
    dispatch(setSettings(data));
  }, [dispatch, currency, decimalPlaces, language]);

  const updateSettings = useCallback(
    async (input: SettingsInput) => {
      const updated = await settingsService.updateSettings(input, {
        currency,
        decimalPlaces,
        language,
      });
      dispatch(setSettings(updated));
      return updated;
    },
    [dispatch, currency, decimalPlaces, language],
  );

  return { currency, decimalPlaces, language, status, loadSettings, updateSettings };
}
