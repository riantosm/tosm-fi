import i18n from "@/helpers/i18n";
import { getApiErrorMessage, httpClient } from "@/services/http-client";
import type {
  PayOccurrenceInput,
  PayOccurrenceResult,
  ScheduleOccurrence,
} from "@/types/schedule-occurrence.types";

export const scheduleOccurrenceService = {
  async fetchPendingOccurrences(): Promise<ScheduleOccurrence[]> {
    try {
      const { data } = await httpClient.get("/schedules/occurrences");
      return data.data as ScheduleOccurrence[];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },

  async payOccurrence(
    idOccurrence: string,
    input: PayOccurrenceInput,
  ): Promise<PayOccurrenceResult> {
    try {
      const { data } = await httpClient.post(`/schedules/occurrences/${idOccurrence}/pay`, input);
      return data.data as PayOccurrenceResult;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },

  async cancelOccurrence(idOccurrence: string): Promise<ScheduleOccurrence> {
    try {
      const { data } = await httpClient.post(`/schedules/occurrences/${idOccurrence}/cancel`);
      return data.data as ScheduleOccurrence;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, i18n.t("schedule.genericError")), { cause: error });
    }
  },
};
