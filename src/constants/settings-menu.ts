import type { IconType } from "react-icons";
import { LuBug, LuCode, LuCoins, LuUserCheck } from "react-icons/lu";
import { ROUTES } from "@/constants/routes";

/** Tile color of a settings entry (soft background + text token). */
export type SettingsMenuTone = "income" | "expense" | "primary" | "investment";

export const SETTINGS_TONE_CLASS: Record<SettingsMenuTone, string> = {
  income: "bg-income-soft text-income-text",
  expense: "bg-expense-soft text-expense-text",
  primary: "bg-primary-soft text-primary-text",
  investment: "bg-investment-soft text-investment-text",
};

export interface SettingsMenuItem {
  key: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  icon: IconType;
  tone: SettingsMenuTone;
  adminOnly?: boolean;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    key: "user-approval",
    titleKey: "settingsMenu.userApproval.title",
    descriptionKey: "settingsMenu.userApproval.description",
    path: ROUTES.SETTINGS_USER_APPROVAL,
    icon: LuUserCheck,
    tone: "income",
    adminOnly: true,
  },
  {
    key: "error-log",
    titleKey: "settingsMenu.errorLog.title",
    descriptionKey: "settingsMenu.errorLog.description",
    path: ROUTES.SETTINGS_ERROR_LOG,
    icon: LuBug,
    tone: "expense",
    adminOnly: true,
  },
  {
    key: "api-doc",
    titleKey: "settingsMenu.apiDoc.title",
    descriptionKey: "settingsMenu.apiDoc.description",
    path: ROUTES.SETTINGS_API_DOC,
    icon: LuCode,
    tone: "primary",
  },
  {
    key: "currency",
    titleKey: "settingsMenu.currency.title",
    descriptionKey: "settingsMenu.currency.description",
    path: ROUTES.SETTINGS_CURRENCY,
    icon: LuCoins,
    tone: "investment",
  },
];
