import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { m } from "motion/react";
import { LuPlus } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { ROUTES } from "@/constants/routes";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { cn } from "@/utils/cn";
import { AMOUNT_MASK, useMoneyFormat } from "@/hooks/use-money-format";
import type { DashboardSummary } from "@/types/report.types";

interface AssetAllocationCardProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  /** Follows the hero's hide/show balance toggle. */
  isAmountVisible?: boolean;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function LegendTile({
  swatchClassName,
  label,
  value,
  onClick,
}: {
  swatchClassName: string;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable flex min-w-0 items-center gap-2.5 rounded-control bg-surface-2 p-3 text-left hover:bg-surface-3"
    >
      <span className={cn("h-7 w-2 shrink-0 rounded-full", swatchClassName)} />
      <span className="flex min-w-0 flex-col gap-px">
        <span className="truncate text-[12px] text-text-3">{label}</span>
        <span className="truncate font-num text-[15px] font-semibold text-text tabular">
          {value}
        </span>
      </span>
    </button>
  );
}

/** Hero side card: investment vs cash stacked bar + the manual "Catat transaksi" entry point. */
export function AssetAllocationCard({
  summary,
  isLoading,
  isAmountVisible = true,
  className,
}: AssetAllocationCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openManualEntry } = useQuickAdd();
  const { symbol, formatCompact } = useMoneyFormat();

  const investmentValue = summary?.investment.totalCurrentValue ?? 0;
  const cashValue = summary?.wallet.totalBalance ?? 0;
  const total = Math.max(0, investmentValue) + Math.max(0, cashValue);
  const investmentPercent =
    total > 0 ? Math.round((Math.max(0, investmentValue) / total) * 100) : 0;
  const cashPercent = total > 0 ? 100 - investmentPercent : 0;
  const isInitialLoading = isLoading && !summary;

  const displayCompact = (value: number) =>
    isAmountVisible ? `${symbol} ${formatCompact(value)}` : AMOUNT_MASK;

  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="truncate font-display text-[17px] font-semibold text-text">
          {t("dashboard.assetAllocation")}
        </h2>
        <Button type="button" size="sm" leftIcon={<LuPlus />} onClick={openManualEntry}>
          {t("dashboard.recordTransaction")}
        </Button>
      </div>

      {isInitialLoading ? (
        <>
          <Skeleton className="h-3.5 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-[60px]" />
            <Skeleton className="h-[60px]" />
          </div>
        </>
      ) : (
        <>
          <div className="flex h-3.5 w-full gap-1" aria-hidden="true">
            {total <= 0 ? (
              <span className="h-full w-full rounded-full bg-surface-2" />
            ) : (
              <>
                {investmentPercent > 0 && (
                  <m.span
                    className="h-full rounded-full bg-investment"
                    initial={{ width: 0 }}
                    animate={{ width: `${investmentPercent}%` }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                )}
                {cashPercent > 0 && <span className="h-full min-w-0 flex-1 rounded-full bg-cash" />}
              </>
            )}
          </div>

          {total <= 0 ? (
            <p className="text-[13px] text-text-3">{t("dashboard.noAllocationData")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <LegendTile
                swatchClassName="bg-investment"
                label={`${t("nav.investment")} · ${investmentPercent}%`}
                value={displayCompact(investmentValue)}
                onClick={() => navigate(ROUTES.INVESTMENT)}
              />
              <LegendTile
                swatchClassName="bg-cash"
                label={`${t("dashboard.cash")} · ${cashPercent}%`}
                value={displayCompact(cashValue)}
                onClick={() => navigate(ROUTES.WALLET)}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
