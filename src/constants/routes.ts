export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TRANSACTIONS: "/transactions",
  SCHEDULE: "/schedule",
  WALLET: "/wallet",
  CATEGORIES: "/categories",
  BUDGETS: "/budgets",
  INVESTMENT: "/investment",
  REPORTS: "/reports",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  SETTINGS_API_DOC: "/settings/api-doc",
  SETTINGS_CURRENCY: "/settings/currency",
  SETTINGS_USER_APPROVAL: "/settings/user-approval",
  SETTINGS_ERROR_LOG: "/settings/error-log",
} as const;

/** `/dashboard?upgrade=1` opens the Upgrade to Pro dialog; `/login?next=upgrade` leads there after login. */
export const UPGRADE_QUERY = "upgrade";
