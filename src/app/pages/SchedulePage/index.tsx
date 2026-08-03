import { createElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlinePause,
  HiOutlinePencil,
  HiOutlinePlay,
  HiOutlinePlus,
  HiOutlineTag,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { Button } from "@/components/atoms/Button";
import { IconLoader } from "@/components/atoms/IconLoader";
import { AddScheduleModal } from "@/layouts/schedule/AddScheduleModal";
import { useSchedules } from "@/hooks/use-schedules";
import { useCategories } from "@/hooks/use-categories";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Schedule } from "@/types/schedule.types";
import { cn } from "@/utils/cn";

function describeFrequency(
  schedule: Schedule,
  t: (key: string, opts?: Record<string, unknown>) => string,
  locale: string,
): string {
  switch (schedule.frequency) {
    case "daily":
      return t("schedule.frequencyDaily");
    case "weekly": {
      const label = t("schedule.frequencyWeekly");
      try {
        const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
        const reference = new Date(2023, 0, 1); // a Sunday
        const days = [...schedule.weekdays]
          .sort()
          .map((day) => formatter.format(new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() + day)))
          .join(", ");
        return days ? `${label} · ${days}` : label;
      } catch {
        return label;
      }
    }
    case "monthly":
      return `${t("schedule.frequencyMonthly")} · ${schedule.dayOfMonth}`;
    case "yearly": {
      try {
        const formatter = new Intl.DateTimeFormat(locale, { month: "long" });
        const monthLabel = schedule.month
          ? formatter.format(new Date(2023, schedule.month - 1, 1))
          : "";
        return `${t("schedule.frequencyYearly")} · ${schedule.dayOfMonth} ${monthLabel}`;
      } catch {
        return t("schedule.frequencyYearly");
      }
    }
    default:
      return schedule.frequency;
  }
}

export function SchedulePage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const {
    schedules,
    status: schedulesStatus,
    loadSchedules,
    setScheduleActive,
    deleteSchedule,
  } = useSchedules();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (schedulesStatus === "idle") void loadSchedules();
  }, [schedulesStatus, loadSchedules]);

  function openCreateModal() {
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  }

  function openEditModal(schedule: Schedule) {
    setEditingSchedule(schedule);
    setIsScheduleModalOpen(true);
  }

  async function handleToggleActive(schedule: Schedule) {
    setBusyId(schedule.idSchedule);
    try {
      await setScheduleActive(schedule.idSchedule, !schedule.isActive);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("schedule.genericError"), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteSchedule(schedule: Schedule) {
    const confirmed = await confirm({
      title: t("schedule.deleteConfirmTitle"),
      description: t("schedule.deleteConfirmDescription"),
      confirmLabel: t("schedule.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setBusyId(schedule.idSchedule);
    try {
      await deleteSchedule(schedule.idSchedule);
      showToast(t("schedule.deleteSuccess"), "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("schedule.genericError"), "error");
    } finally {
      setBusyId(null);
    }
  }

  function categoryIconFor(idCategory: string) {
    const category = categories.find((item) => item.idCategory === idCategory);
    return {
      Icon: category ? resolveCategoryIcon(category.icon) : HiOutlineTag,
      color: category?.color ?? "#71717a",
    };
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("schedule.title")}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("schedule.subtitle")}
          </Words>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
              {t("schedule.allSchedulesSectionTitle")}
            </Words>
            <Button onClick={openCreateModal} className="px-3 py-1.5">
              <HiOutlinePlus className="h-4 w-4" />
              <Words type="xs/bold" as="span">
                {t("schedule.addSchedule")}
              </Words>
            </Button>
          </div>

          {schedulesStatus === "loading" && (
            <div className="flex items-center justify-center py-8">
              <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          )}

          {schedulesStatus === "loaded" && schedules.length === 0 && (
            <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
              {t("schedule.allSchedulesEmpty")}
            </Words>
          )}

          {schedules.length > 0 && (
            <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
              <div className="divide-y divide-ink-100 dark:divide-ink-800">
                {schedules.map((schedule) => {
                  const { Icon, color } = categoryIconFor(schedule.idCategory);
                  const isBusy = busyId === schedule.idSchedule;

                  return (
                    <div
                      key={schedule.idSchedule}
                      className="flex flex-wrap items-center gap-3 bg-white px-4 py-3 dark:bg-ink-900"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${color}33`, opacity: schedule.isActive ? 1 : 0.5 }}
                      >
                        {createElement(Icon, { className: "h-5 w-5", style: { color } })}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <Words
                            type="sm/bold"
                            className={cn(
                              "truncate",
                              schedule.isActive
                                ? "text-ink-900 dark:text-ink-50"
                                : "text-ink-400 dark:text-ink-500",
                            )}
                          >
                            {schedule.title}
                          </Words>
                          {!schedule.isActive && (
                            <span className="shrink-0 rounded-md bg-ink-100 px-1.5 py-0.5 dark:bg-ink-800">
                              <Words type="xxs/bold" as="span" className="text-ink-500 dark:text-ink-400 flex">
                                {t("schedule.pausedBadge")}
                              </Words>
                            </span>
                          )}
                        </div>
                        <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
                          {describeFrequency(schedule, t, language)}
                        </Words>
                      </div>
                      <Words type="sm/bold" className="shrink-0 text-ink-900 dark:text-ink-50">
                        {format(schedule.amount)}
                      </Words>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={isBusy}
                          aria-label={schedule.isActive ? t("schedule.pauseButton") : t("schedule.resumeButton")}
                          onClick={() => void handleToggleActive(schedule)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 disabled:opacity-60 dark:hover:bg-ink-800 dark:hover:text-ink-200"
                        >
                          {schedule.isActive ? (
                            <HiOutlinePause className="h-4 w-4" />
                          ) : (
                            <HiOutlinePlay className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          aria-label={t("schedule.editSchedule")}
                          onClick={() => openEditModal(schedule)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 disabled:opacity-60 dark:hover:bg-ink-800 dark:hover:text-ink-200"
                        >
                          <HiOutlinePencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          aria-label={t("schedule.deleteConfirmAction")}
                          onClick={() => void handleDeleteSchedule(schedule)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddScheduleModal
        isOpen={isScheduleModalOpen}
        schedule={editingSchedule}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </DashboardLayout>
  );
}
