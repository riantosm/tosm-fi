import { useCallback } from "react";
import { scheduleService } from "@/services/schedule.service";
import type { ScheduleInput } from "@/types/schedule.types";
import {
  addSchedule,
  removeSchedule,
  setSchedules,
  setSchedulesLoading,
  updateSchedule,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

export function useSchedules() {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector((state) => state.schedule.schedules);
  const status = useAppSelector((state) => state.schedule.status);

  const loadSchedules = useCallback(async () => {
    dispatch(setSchedulesLoading());
    const data = await scheduleService.fetchSchedules();
    dispatch(setSchedules(data));
  }, [dispatch]);

  const createSchedule = useCallback(
    async (input: ScheduleInput) => {
      const created = await scheduleService.createSchedule(input);
      dispatch(addSchedule(created));
      return created;
    },
    [dispatch],
  );

  const editSchedule = useCallback(
    async (idSchedule: string, input: ScheduleInput) => {
      const updated = await scheduleService.updateSchedule(idSchedule, input);
      dispatch(updateSchedule(updated));
      return updated;
    },
    [dispatch],
  );

  const setScheduleActive = useCallback(
    async (idSchedule: string, isActive: boolean) => {
      const updated = await scheduleService.setScheduleActive(idSchedule, isActive);
      dispatch(updateSchedule(updated));
      return updated;
    },
    [dispatch],
  );

  const deleteSchedule = useCallback(
    async (idSchedule: string) => {
      await scheduleService.deleteSchedule(idSchedule);
      dispatch(removeSchedule(idSchedule));
    },
    [dispatch],
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
