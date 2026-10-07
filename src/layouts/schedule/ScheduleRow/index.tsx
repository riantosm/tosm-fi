import { createElement } from "react";
import { useTranslation } from "react-i18next";
import { LuPause, LuPencil, LuPlay, LuRepeat, LuTag, LuTrash2 } from "react-icons/lu";
import { Badge } from "@/components/atoms/Badge";
import { IconButton } from "@/components/atoms/IconButton";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useMoneyFormat } from "@/hooks/use-money-format";
import type { Category } from "@/types/category.types";
import type { Schedule } from "@/types/schedule.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface ScheduleRowProps {
  schedule: Schedule;
  category: Category | undefined;
  wallet: WalletAccount | undefined;
  frequencyLabel: string;
  /** "Hari ini", "Sel, 20 Okt" — or null when paused / never due. */
  nextLabel: string | null;
  isBusy?: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** A recurring schedule: table-like row on desktop, card on phones. */
export function ScheduleRow({
  schedule,
  category,
  wallet,
  frequencyLabel,
  nextLabel,
  isBusy,
  onToggleActive,
  onEdit,
  onDelete,
}: ScheduleRowProps) {
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const isIncome = schedule.type === "income";
  const color = category?.color ?? "#8A94A0";
  const amount = `${isIncome ? "+" : "−"}${formatNumber(schedule.amount)}`;
  const isPaused = !schedule.isActive;

  const tile = (
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `${color}26`, color }}
    >
      {createElement(category ? resolveCategoryIcon(category.icon) : LuTag, {
        className: "size-5",
      })}
    </span>
  );

  const actions = (
    <span className="flex shrink-0 items-center gap-2">
      <IconButton
        label={isPaused ? t("schedule.resumeButton") : t("schedule.pauseButton")}
        icon={isPaused ? <LuPlay /> : <LuPause />}
        size="sm"
        onClick={onToggleActive}
        disabled={isBusy}
      />
      <IconButton
        label={t("schedule.editSchedule")}
        icon={<LuPencil />}
        size="sm"
        onClick={onEdit}
        disabled={isBusy}
      />
      <IconButton
        label={t("wallet.deleteButton")}
        icon={<LuTrash2 />}
        size="sm"
        variant="danger"
        onClick={onDelete}
        disabled={isBusy}
      />
    </span>
  );

  const pausedBadge = isPaused && (
    <Badge tone="neutral" className="gap-1">
      <LuPause className="size-3" />
      {t("schedule.pausedBadge")}
    </Badge>
  );

  return (
    <div className={cn("transition-opacity duration-300", isPaused && "opacity-60")}>
      {/* Desktop row */}
      <div className="hidden items-center gap-4 py-3.5 lg:flex">
        {tile}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[14.5px] font-semibold text-text">{schedule.title}</span>
            {pausedBadge}
          </span>
          <span className="truncate text-[12.5px] text-text-3">
            {[category?.nameCategory, wallet?.nameWallet].filter(Boolean).join(" · ")}
          </span>
        </span>
        <span className="flex w-[210px] shrink-0 items-center gap-2 truncate rounded-full bg-surface-2 px-3.5 py-1.5 text-[13px] text-text-2 xl:w-[220px]">
          <LuRepeat className="size-3.5 shrink-0" />
          <span className="truncate" title={frequencyLabel}>
            {frequencyLabel}
          </span>
        </span>
        <span className="flex w-[110px] shrink-0 flex-col gap-0.5">
          <span className="text-[12px] text-text-3">{t("schedule.next")}</span>
          <span className="truncate text-[13.5px] text-text">{nextLabel ?? "—"}</span>
        </span>
        <span
          className={cn(
            "w-[120px] shrink-0 text-right font-num text-[15px] font-semibold tabular",
            isIncome ? "text-income-text" : "text-expense-text",
          )}
        >
          {amount}
        </span>
        {actions}
      </div>

      {/* Phone / tablet card */}
      <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card lg:hidden">
        <div className="flex items-center gap-3">
          {tile}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[15px] font-semibold text-text">{schedule.title}</span>
              {pausedBadge}
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-text-2">
              <LuRepeat className="size-3.5 shrink-0" />
              <span className="truncate" title={frequencyLabel}>
                {frequencyLabel}
              </span>
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 self-start pt-1 font-num text-[15px] font-semibold tabular",
              isIncome ? "text-income-text" : "text-expense-text",
            )}
          >
            {amount}
          </span>
        </div>
        <span className="h-px bg-border" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[13px] text-text-2">
            {t("schedule.nextInline", { when: nextLabel ?? "—" })}
          </span>
          {actions}
        </div>
      </div>
    </div>
  );
}
