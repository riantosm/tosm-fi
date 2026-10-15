import { useCallback } from "react";
import { scheduleService } from "@/services/schedule.service";
import { useScheduleOccurrences } from "@/hooks/use-schedule-occurrences";
import type { ScheduleInput } from "@/types/schedule.types";
import {
  addSchedule,
  removeSchedule,
  setSchedules,
  setSchedulesFailed,
  setSchedulesLoading,
  updateSchedule,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useSchedules() {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector((state) => state.schedule.schedules);
  const status = useAppSelector((state) => state.schedule.status);
  // Any schedule change can add, move or drop pending bills (Dashboard / Transaksi), so they're
  // refetched after every mutation instead of waiting for those pages to remount (same as mobile).
  const { loadPendingOccurrences } = useScheduleOccurrences();

  const loadSchedules = useCallback(async () => {
    dispatch(setSchedulesLoading());
    try {
      dispatch(setSchedules(await scheduleService.fetchSchedules()));
    } catch {
      dispatch(setSchedulesFailed());
    }
  }, [dispatch]);

  const createSchedule = useCallback(
    async (input: ScheduleInput) => {
      const created = await scheduleService.createSchedule(input);
      dispatch(addSchedule(created));
      void loadPendingOccurrences();
      return created;
    },
    [dispatch, loadPendingOccurrences],
  );

  const editSchedule = useCallback(
    async (idSchedule: string, input: ScheduleInput) => {
      const updated = await scheduleService.updateSchedule(idSchedule, input);
      dispatch(updateSchedule(updated));
      void loadPendingOccurrences();
      return updated;
    },
    [dispatch, loadPendingOccurrences],
  );

  const setScheduleActive = useCallback(
    async (idSchedule: string, isActive: boolean) => {
      const updated = await scheduleService.setScheduleActive(idSchedule, isActive);
      dispatch(updateSchedule(updated));
      void loadPendingOccurrences();
      return updated;
    },
    [dispatch, loadPendingOccurrences],
  );

  const deleteSchedule = useCallback(
    async (idSchedule: string) => {
      await scheduleService.deleteSchedule(idSchedule);
      dispatch(removeSchedule(idSchedule));
      void loadPendingOccurrences();
    },
    [dispatch, loadPendingOccurrences],
  );

  return {
    schedules,
    status,
    loadSchedules,
    createSchedule,
    editSchedule,
    setScheduleActive,
    deleteSchedule,
  };
}
