import type { IconType } from "react-icons";
import { HiOutlineBanknotes, HiOutlineCodeBracketSquare } from "react-icons/hi2";
import { ROUTES } from "@/constants/routes";

export interface SettingsMenuItem {
  key: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  icon: IconType;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    key: "api-doc",
    titleKey: "settingsMenu.apiDoc.title",
    descriptionKey: "settingsMenu.apiDoc.description",
    path: ROUTES.SETTINGS_API_DOC,
    icon: HiOutlineCodeBracketSquare,
  },
  {
    key: "currency",
    titleKey: "settingsMenu.currency.title",
    descriptionKey: "settingsMenu.currency.description",
    path: ROUTES.SETTINGS_CURRENCY,
    icon: HiOutlineBanknotes,
  },
];
