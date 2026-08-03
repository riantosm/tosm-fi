import type { Transaction } from "@/types/transaction.types";
import type { ScheduleType } from "@/types/schedule.types";

export type ScheduleOccurrenceStatus = "pending" | "paid" | "cancelled";

export interface ScheduleOccurrence {
  idOccurrence: string;
  idSchedule: string;
  dueDate: string;
  status: ScheduleOccurrenceStatus;
  type: ScheduleType;
  title: string;
  amount: number;
  idWallet: string;
  idCategory: string;
  idSubCategory: string | null;
  idTransaction: string | null;
}

export interface PayOccurrenceInput {
  amount?: number;
  date?: string;
  idWallet?: string;
  idCategory?: string;
  idSubCategory?: string | null;
  title?: string;
  notes?: string;
}

export interface PayOccurrenceResult {
  transaction: Transaction;
  occurrence: ScheduleOccurrence;
}
