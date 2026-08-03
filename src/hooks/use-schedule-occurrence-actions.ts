import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useScheduleOccurrences } from "@/hooks/use-schedule-occurrences";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";

// Shared Bayar/Batal wiring for any view that renders pending schedule
// occurrences inline (TransactionsPage, DashboardPage) — Bayar opens the
// shared PayOccurrenceModal (the caller renders it), Batal runs the same
// destructive-confirm + toast pattern used everywhere else in the app.
export function useScheduleOccurrenceActions() {
  const { t } = useTranslation();
  const { cancelOccurrence } = useScheduleOccurrences();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  const [payingOccurrence, setPayingOccurrence] = useState<ScheduleOccurrence | null>(null);

  const openPayModal = useCallback((occurrence: ScheduleOccurrence) => {
    setPayingOccurrence(occurrence);
  }, []);

  const closePayModal = useCallback(() => setPayingOccurrence(null), []);

  const handleCancelOccurrence = useCallback(
    async (occurrence: ScheduleOccurrence) => {
      const confirmed = await confirm({
        title: t("schedule.cancelConfirmTitle"),
        description: t("schedule.cancelConfirmDescription"),
        confirmLabel: t("schedule.cancelConfirmAction"),
        cancelLabel: t("common.cancel"),
        destructive: true,
      });
      if (!confirmed) return;

      try {
        await cancelOccurrence(occurrence.idOccurrence);
        showToast(t("schedule.cancelSuccess"), "success");
      } catch (error) {
        showToast(error instanceof Error ? error.message : t("schedule.genericError"), "error");
      }
    },
    [cancelOccurrence, confirm, showToast, t],
  );

  return { payingOccurrence, openPayModal, closePayModal, handleCancelOccurrence };
}
