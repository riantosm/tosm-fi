import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type { Schedule, ScheduleInput } from "@/types/schedule.types";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";

export const scheduleService = {
  async fetchSchedules(): Promise<Schedule[]> {
    try {
      const { data } = await httpClient.get("/schedules");
      return data.data as Schedule[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },

  /** `idTransaction` = the transaction the schedule was made from; it pays the first due date. */
  async createSchedule(input: ScheduleInput, idTransaction?: string): Promise<Schedule> {
    try {
      const { data } = await httpClient.post(
        "/schedules",
        idTransaction ? { ...input, idTransaction } : input,
      );
      return data.data as Schedule;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },

  /** Marks the schedule's first due date as paid by an already-saved transaction. */
  async linkTransaction(idSchedule: string, idTransaction: string): Promise<ScheduleOccurrence> {
    try {
      const { data } = await httpClient.post(`/schedules/${idSchedule}/link-transaction`, {
        idTransaction,
      });
      return data.data as ScheduleOccurrence;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },

  async updateSchedule(idSchedule: string, input: ScheduleInput): Promise<Schedule> {
    try {
      const { data } = await httpClient.patch(`/schedules/${idSchedule}`, input);
      return data.data as Schedule;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },

  async setScheduleActive(idSchedule: string, isActive: boolean): Promise<Schedule> {
    try {
      const { data } = await httpClient.patch(`/schedules/${idSchedule}/pause`, { isActive });
      return data.data as Schedule;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },

  async deleteSchedule(idSchedule: string): Promise<void> {
    try {
      await httpClient.delete(`/schedules/${idSchedule}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },
};
