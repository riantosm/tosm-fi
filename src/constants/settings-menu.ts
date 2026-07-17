import type { IconType } from "react-icons";
import {
  HiOutlineBanknotes,
  HiOutlineCodeBracketSquare,
  HiOutlineExclamationTriangle,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { ROUTES } from "@/constants/routes";

export interface SettingsMenuItem {
  key: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  icon: IconType;
  adminOnly?: boolean;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    key: "user-approval",
    titleKey: "settingsMenu.userApproval.title",
    descriptionKey: "settingsMenu.userApproval.description",
    path: ROUTES.SETTINGS_USER_APPROVAL,
    icon: HiOutlineUserGroup,
    adminOnly: true,
  },
  {
    key: "error-log",
    titleKey: "settingsMenu.errorLog.title",
    descriptionKey: "settingsMenu.errorLog.description",
    path: ROUTES.SETTINGS_ERROR_LOG,
    icon: HiOutlineExclamationTriangle,
    adminOnly: true,
  },
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
