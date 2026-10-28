import type { UserPlan } from "@/types/auth.types";

/** Mirrors tosm-fi-be's PLAN_LIMITS (utils/plan.ts). `null` = unlimited. */
export interface PlanLimits {
  wallets: number | null;
  categories: number | null;
  budgets: number | null;
  schedules: number | null;
  instruments: number | null;
  aiMessagesPerMonth: number | null;
  subCategories: boolean;
  receiptScan: boolean;
  monthlyTrend: boolean;
  customReportRange: boolean;
  exportPdfExcel: boolean;
  /** Free reports may only go back to the 1st of last month. */
  reportMonthsBack: number | null;
}

export interface PlanUsage {
  wallets: number;
  categories: number;
  budgets: number;
  schedules: number;
  instruments: number;
  aiMessages: number;
}

/** `GET /user/me/plan`. */
export interface PlanInfo {
  plan: UserPlan;
  proSince: string | null;
  limits: PlanLimits;
  usage: PlanUsage;
  proLifetimePrice: number;
}

export type PlanFeature =
  | "wallets"
  | "categories"
  | "subCategories"
  | "budgets"
  | "schedules"
  | "instruments"
  | "reportRange"
  | "monthlyTrend"
  | "aiMessages"
  | "receiptScan"
  | "export";

/** `POST /payments/pro/checkout`. */
export interface ProCheckout {
  orderId: string;
  snapToken: string;
  redirectUrl: string;
  clientKey: string;
  isProduction: boolean;
  amount: number;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export interface PaymentOrderStatus {
  orderId: string;
  status: PaymentStatus;
  amount: number;
  paymentType: string | null;
  paidAt: string | null;
}
