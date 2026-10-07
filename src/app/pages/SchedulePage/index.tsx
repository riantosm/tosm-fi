import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCalendarClock, LuCalendarX, LuPlus } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { AddScheduleModal } from "@/layouts/schedule/AddScheduleModal";
import { ScheduleRow } from "@/layouts/schedule/ScheduleRow";
import { ScheduleSummary, type NextDueInfo } from "@/layouts/schedule/ScheduleSummary";
import {
  describeFrequency,
  formatDueDate,
  formatLongDate,
  getNextDueDate,
  monthlyEquivalent,
  ruleFromSchedule,
} from "@/layouts/schedule/schedule-utils";
import { useSchedules } from "@/hooks/use-schedules";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useLanguage } from "@/hooks/use-language";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { toIntlLocale } from "@/utils/locale";
import type { Schedule } from "@/types/schedule.types";

export function SchedulePage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
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
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

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
      showToast(
        schedule.isActive ? t("schedule.pauseSuccess") : t("schedule.resumeSuccess"),
        "success",
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("schedule.genericError"), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteSchedule(schedule: Schedule) {
    const confirmed = await confirm({
      title: t("schedule.deleteConfirmTitle", { name: schedule.title }),
      description: t("schedule.deleteConfirmDescription"),
      confirmLabel: t("schedule.deleteScheduleAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
      icon: LuCalendarX,
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

  const dueLabels = { today: t("schedule.today"), tomorrow: t("schedule.tomorrow") };

  const rows = useMemo(
    () =>
      schedules.map((schedule) => {
        const rule = ruleFromSchedule(schedule);
        const next = schedule.isActive ? getNextDueDate(rule) : null;
        return { schedule, rule, next };
      }),
    [schedules],
  );
  const activeRows = rows.filter((row) => row.schedule.isActive);
  const pausedRows = rows.filter((row) => !row.schedule.isActive);

  const nextDueRow = activeRows
    .filter((row) => row.next)
    .sort((a, b) => (a.next as Date).getTime() - (b.next as Date).getTime())[0];
  const nextDue: NextDueInfo | null = nextDueRow?.next
    ? {
        title: nextDueRow.schedule.title,
        whenLabel: formatDueDate(nextDueRow.next, locale, dueLabels).toLocaleLowerCase(locale),
        dateLabel: formatLongDate(nextDueRow.next, locale, false),
        amount: nextDueRow.schedule.amount,
        isIncome: nextDueRow.schedule.type === "income",
      }
    : null;

  let monthlyExpense = 0;
  let monthlyExpenseCount = 0;
  let monthlyIncome = 0;
  let monthlyIncomeCount = 0;
  for (const { schedule } of activeRows) {
    const perMonth = monthlyEquivalent(schedule);
    if (perMonth === null) continue;
    if (schedule.type === "income") {
      monthlyIncome += perMonth;
      monthlyIncomeCount++;
    } else {
      monthlyExpense += perMonth;
      monthlyExpenseCount++;
    }
  }

  const isInitialLoading = schedulesStatus !== "loaded" && schedules.length === 0;
  const isEmpty = schedulesStatus === "loaded" && schedules.length === 0;
  const subtitle = isEmpty
    ? t("schedule.emptySubtitle")
    : t("schedule.pageSubtitle", { active: activeRows.length, paused: pausedRows.length });

  const sections = [
    {
      key: "active",
      label: t("schedule.activeSection", { count: activeRows.length }),
      rows: activeRows,
    },
    {
      key: "paused",
      label: t("schedule.pausedSection", { count: pausedRows.length }),
      rows: pausedRows,
    },
  ].filter((section) => section.rows.length > 0);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("nav.schedule")}
        subtitle={subtitle}
        showSubtitleOnMobile={false}
        actions={
          <Button type="button" leftIcon={<LuPlus />} onClick={openCreateModal}>
            {t("schedule.addSchedule")}
          </Button>
        }
        mobileActions={
          !isEmpty && (
            <IconButton
              label={t("schedule.addSchedule")}
              icon={<LuPlus />}
              variant="primary"
              size="lg"
              tooltip={false}
              onClick={openCreateModal}
            />
          )
        }
      />

      {isEmpty ? (
        <Reveal immediate>
          <EmptyState
            variant="page"
            icon={<LuCalendarClock />}
            title={t("schedule.emptyTitle")}
            description={t("schedule.emptyDescription")}
            action={
              <Button type="button" leftIcon={<LuPlus />} onClick={openCreateModal}>
                {t("schedule.addFirst")}
              </Button>
            }
            className="min-h-[360px] lg:min-h-[520px]"
          />
        </Reveal>
      ) : (
        <>
          <Reveal immediate>
            <ScheduleSummary
              nextDue={nextDue}
              monthlyExpense={monthlyExpense}
              monthlyExpenseCount={monthlyExpenseCount}
              monthlyIncome={monthlyIncome}
              monthlyIncomeCount={monthlyIncomeCount}
              isLoading={isInitialLoading}
            />
          </Reveal>

          <Reveal delay={0.05}>
            <Card className="flex flex-col gap-3 bg-transparent p-0 shadow-none lg:gap-0 lg:bg-surface lg:p-6 lg:shadow-card">
              {isInitialLoading
                ? Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-[68px] rounded-control" />
                  ))
                : sections.map((section, sectionIndex) => (
                    <Fragment key={section.key}>
                      <span
                        className={
                          sectionIndex > 0
                            ? "px-1 pt-2 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase lg:px-0 lg:pt-5 lg:pb-1"
                            : "px-1 text-[12px] font-semibold tracking-[0.06em] text-text-3 uppercase lg:px-0 lg:pb-1"
                        }
                      >
                        {section.label}
                      </span>
                      <div className="flex flex-col gap-3 lg:gap-0 lg:divide-y lg:divide-border">
                        {section.rows.map(({ schedule, rule, next }) => (
                          <ScheduleRow
                            key={schedule.idSchedule}
                            schedule={schedule}
                            category={categories.find(
                              (item) => item.idCategory === schedule.idCategory,
                            )}
                            wallet={wallets.find((item) => item.idWallet === schedule.idWallet)}
                            frequencyLabel={describeFrequency(rule, t, locale)}
                            nextLabel={next ? formatDueDate(next, locale, dueLabels) : null}
                            isBusy={busyId === schedule.idSchedule}
                            onToggleActive={() => void handleToggleActive(schedule)}
                            onEdit={() => openEditModal(schedule)}
                            onDelete={() => void handleDeleteSchedule(schedule)}
                          />
                        ))}
                      </div>
                    </Fragment>
                  ))}
            </Card>
          </Reveal>
        </>
      )}

      <AddScheduleModal
        isOpen={isScheduleModalOpen}
        schedule={editingSchedule}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
