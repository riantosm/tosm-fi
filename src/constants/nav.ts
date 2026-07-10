import { ROUTES } from "@/constants/routes";
import type { IconType } from "react-icons";
import {
  HiOutlineSquares2X2,
  HiOutlineArrowsRightLeft,
  HiOutlineWallet,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

export interface NavItem {
  labelKey: string;
  path: string;
  icon: IconType;
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
  [{ labelKey: "nav.reports", path: ROUTES.REPORTS, icon: HiOutlineDocumentText }],
];

export const SETTINGS_NAV_ITEM: NavItem = {
  labelKey: "nav.settings",
  path: ROUTES.SETTINGS,
  icon: HiOutlineCog6Tooth,
};
