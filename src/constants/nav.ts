import { ROUTES } from "@/constants/routes";
import type { IconType } from "react-icons";
import {
  HiOutlineSquares2X2,
  HiOutlineArrowsRightLeft,
  HiOutlineWallet,
  HiOutlineTag,
  HiOutlineDocumentText,
} from "react-icons/hi2";

export interface NavItem {
  labelKey: string;
  path: string;
  icon: IconType;
}

export const NAV_GROUPS: NavItem[][] = [
  [
    { labelKey: "nav.dashboard", path: ROUTES.DASHBOARD, icon: HiOutlineSquares2X2 },
    { labelKey: "nav.transactions", path: "/transactions", icon: HiOutlineArrowsRightLeft },
  ],
  [
    { labelKey: "nav.wallet", path: "/wallet", icon: HiOutlineWallet },
    { labelKey: "nav.category", path: "/categories", icon: HiOutlineTag },
  ],
  [{ labelKey: "nav.reports", path: "/reports", icon: HiOutlineDocumentText }],
];
