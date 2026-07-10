import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import id from "./lang/id.json";
import en from "./lang/en.json";
import jp from "./lang/jp.json";
import { LANG_STORAGE_KEY } from "@/constants/storage-keys";

const storedLanguage = localStorage.getItem(LANG_STORAGE_KEY);

i18n.use(initReactI18next).init({
  fallbackLng: "id",
  lng: storedLanguage ?? "id",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    id: {
      translation: id,
    },
    en: {
      translation: en,
    },
    jp: {
      translation: jp,
    },
  },
});

export default i18n;
