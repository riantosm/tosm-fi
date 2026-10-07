import type { IconType } from "react-icons";
import {
  LuArrowLeftRight,
  LuCalendarClock,
  LuChartColumn,
  LuLayoutGrid,
  LuSettings,
  LuTag,
  LuTarget,
  LuTrendingUp,
  LuWallet,
} from "react-icons/lu";
import { ROUTES } from "@/constants/routes";

export interface NavItem {
  /** Full label (menus, sheets, a11y). */
  labelKey: string;
  /** Short label under rail / bottom-nav icons. */
  shortLabelKey: string;
  path: string;
  icon: IconType;
  /** Tint used by the phone "Lainnya" grid tiles. */
  tone?: "primary" | "expense" | "investment" | "income" | "neutral";
}

export const NAV_DASHBOARD: NavItem = {
  labelKey: "nav.dashboard",
  shortLabelKey: "navShort.dashboard",
  path: ROUTES.DASHBOARD,
  icon: LuLayoutGrid,
};
export const NAV_TRANSACTIONS: NavItem = {
  labelKey: "nav.transactions",
  shortLabelKey: "navShort.transactions",
  path: ROUTES.TRANSACTIONS,
  icon: LuArrowLeftRight,
};
export const NAV_WALLET: NavItem = {
  labelKey: "nav.wallet",
  shortLabelKey: "navShort.wallet",
  path: ROUTES.WALLET,
  icon: LuWallet,
  tone: "primary",
};
export const NAV_CATEGORY: NavItem = {
  labelKey: "nav.category",
  shortLabelKey: "navShort.category",
  path: ROUTES.CATEGORIES,
  icon: LuTag,
  tone: "expense",
};
export const NAV_SCHEDULE: NavItem = {
  labelKey: "nav.schedule",
  shortLabelKey: "navShort.schedule",
  path: ROUTES.SCHEDULE,
  icon: LuCalendarClock,
  tone: "investment",
};
export const NAV_BUDGETS: NavItem = {
  labelKey: "nav.budgets",
  shortLabelKey: "navShort.budgets",
  path: ROUTES.BUDGETS,
  icon: LuTarget,
  tone: "income",
};
export const NAV_INVESTMENT: NavItem = {
  labelKey: "nav.investment",
  shortLabelKey: "navShort.investment",
  path: ROUTES.INVESTMENT,
  icon: LuTrendingUp,
};
export const NAV_REPORTS: NavItem = {
  labelKey: "nav.reports",
  shortLabelKey: "navShort.reports",
  path: ROUTES.REPORTS,
  icon: LuChartColumn,
  tone: "primary",
};
export const NAV_SETTINGS: NavItem = {
  labelKey: "nav.settings",
  shortLabelKey: "navShort.settings",
  path: ROUTES.SETTINGS,
  icon: LuSettings,
  tone: "neutral",
};

/** Desktop rail, top to bottom (settings is pinned to the bottom separately). */
export const RAIL_ITEMS: NavItem[] = [
  NAV_DASHBOARD,
  NAV_TRANSACTIONS,
  NAV_WALLET,
  NAV_CATEGORY,
  NAV_SCHEDULE,
  NAV_BUDGETS,
  NAV_INVESTMENT,
  NAV_REPORTS,
];

/** Pages reached through the phone "Lainnya" sheet — they mark the Lainnya slot active. */
export const MORE_MENU_ITEMS: NavItem[] = [
  NAV_WALLET,
  NAV_CATEGORY,
  NAV_SCHEDULE,
  NAV_BUDGETS,
  NAV_REPORTS,
  NAV_SETTINGS,
];
