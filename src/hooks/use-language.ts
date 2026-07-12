import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/use-settings";

export function useLanguage() {
  const { i18n } = useTranslation();
  const { updateSettings } = useSettings();

  function changeLanguage(code: string) {
    void i18n.changeLanguage(code);
    void updateSettings({ language: code });
  }

  return { language: i18n.language, changeLanguage };
}
