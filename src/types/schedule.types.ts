import type { CategoryType } from "@/types/category.types";

export type ScheduleType = CategoryType;
export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface Schedule {
  idSchedule: string;
  title: string;
  notes: string;
  type: ScheduleType;
  amount: number;
  idWallet: string;
  idCategory: string;
  idSubCategory: string | null;
  frequency: ScheduleFrequency;
  /** 0=Minggu..6=Sabtu — only meaningful when frequency === "weekly". */
  weekdays: number[];
  /** Derived server-side from startDate. */
  dayOfMonth: number | null;
  /** Derived server-side from startDate — only set for yearly. */
  month: number | null;
  startDate: string;
  isActive: boolean;
}

export type ScheduleInput = Omit<Schedule, "idSchedule" | "dayOfMonth" | "month" | "isActive">;

/**
 * Initial values for a new schedule (e.g. "Jadikan transaksi terjadwal" in the transaction
 * form). The recurrence rule is left out on purpose — the user picks it in the schedule form.
 */
export type ScheduleDraft = Partial<Omit<ScheduleInput, "frequency" | "weekdays">>;
