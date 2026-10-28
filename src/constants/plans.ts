import type { UserPlan } from "@/types/auth.types";
import type { PlanFeature, PlanLimits } from "@/types/plan.types";

/**
 * Local copy of tosm-fi-be's PLAN_LIMITS, used before `/user/me/plan` has
 * loaded (and by the public landing page). The backend stays the authority.
 */
export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    wallets: 3,
    categories: 10,
    budgets: 1,
    schedules: 3,
    instruments: 1,
    aiMessagesPerMonth: 20,
    subCategories: false,
    receiptScan: false,
    monthlyTrend: false,
    customReportRange: false,
    exportPdfExcel: false,
    reportMonthsBack: 1,
  },
  pro: {
    wallets: null,
    categories: null,
    budgets: null,
    schedules: null,
    instruments: null,
    aiMessagesPerMonth: 100,
    subCategories: true,
    receiptScan: true,
    monthlyTrend: true,
    customReportRange: true,
    exportPdfExcel: true,
    reportMonthsBack: null,
  },
};

export const PRO_LIFETIME_PRICE = 149000;
/** Struck-through "normal" price shown next to the launch price. */
export const PRO_LIFETIME_LIST_PRICE = 199000;

/** `data.code` of the backend's 403 when a Free plan limit blocks a request. */
export const PLAN_LIMIT_CODE = "PLAN_LIMIT";
/** Window event http-client fires for a PLAN_LIMIT response (see UpgradeProvider). */
export const PLAN_LIMIT_EVENT = "tosmfi:plan-limit";

export interface PlanLimitEventDetail {
  feature?: PlanFeature;
  message?: string;
}
