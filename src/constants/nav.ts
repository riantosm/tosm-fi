import { ROUTES } from "@/constants/routes";
import type { IconType } from "react-icons";
import {
  HiOutlineSquares2X2,
  HiOutlineArrowsRightLeft,
  HiOutlineWallet,
  HiOutlineTag,
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

export interface NavItem {
  labelKey: string;
  path: string;
  icon: IconType;
  isComingSoon?: boolean;
}

export const NAV_GROUPS: NavItem[][] = [
  [
    { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: HiOutlineSquares2X2 },
    { labelKey: "nav.transactions", path: ROUTES.TRANSACTIONS, icon: HiOutlineArrowsRightLeft },
  ],
  [
    { labelKey: "nav.wallet", path: ROUTES.WALLET, icon: HiOutlineWallet },
    { labelKey: "nav.category", path: ROUTES.CATEGORIES, icon: HiOutlineTag },
  ],
  [{ labelKey: "nav.investment", path: ROUTES.INVESTMENT, icon: HiOutlineChartPie }],
  [{ labelKey: "nav.reports", path: ROUTES.REPORTS, icon: HiOutlineDocumentText }],
];

export const SETTINGS_NAV_ITEM: NavItem = {
  labelKey: "nav.settings",
  path: ROUTES.SETTINGS,
  icon: HiOutlineCog6Tooth,
};
