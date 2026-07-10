import { useTranslation } from "react-i18next";
import { LANG_STORAGE_KEY } from "@/constants/storage-keys";

export function useLanguage() {
  const { i18n } = useTranslation();

  function changeLanguage(code: string) {
    void i18n.changeLanguage(code);
    localStorage.setItem(LANG_STORAGE_KEY, code);
  }

  return { language: i18n.language, changeLanguage };
}
