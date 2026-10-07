import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuArrowUpRight, LuCheck, LuPencil, LuTrendingUpDown } from "react-icons/lu";
import { Monogram } from "@/components/atoms/Monogram";
import { InvestmentSparkline } from "@/layouts/investment/InvestmentSparkline";
import { MoneyAmount } from "@/layouts/investment/MoneyAmount";
import { ProfitLossPill } from "@/layouts/investment/ProfitLossPill";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { getAccountTotals } from "@/utils/investment";
import { cn } from "@/utils/cn";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";
import type { TimelinePoint } from "@/types/investment-transaction.types";

interface InvestmentAccountCardProps {
  account: InvestmentAccount;
  instrument: Instrument;
  sparkline: TimelinePoint[];
  /** Share of the instrument's value, 0–100. */
  share: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onWithdraw: () => void;
  onProfitLoss: () => void;
}

/** Account card on the instrument detail: tap to add/remove it from the chart; Edit / Tarik / P/L below. */
export function InvestmentAccountCard({
  account,
  instrument,
  sparkline,
  share,
  isSelected,
  onToggleSelect,
  onEdit,
  onWithdraw,
  onProfitLoss,
}: InvestmentAccountCardProps) {
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const totals = getAccountTotals(account);

  const check = (
    <span
      className={cn(
        "flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200",
        isSelected ? "border-primary bg-primary text-primary-fg" : "border-text-3 bg-surface",
      )}
    >
      <AnimatePresence initial={false}>
        {isSelected && (
          <m.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
          >
            <LuCheck className="size-[13px]" strokeWidth={3} />
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card transition-[box-shadow] duration-300 lg:p-6",
        isSelected ? "ring-2 ring-primary" : "ring-1 ring-border",
      )}
    >
      <button
        type="button"
        onClick={onToggleSelect}
        aria-pressed={isSelected}
        aria-label={t("investment.toggleAccountChart", { name: account.nameInvestmentAccount })}
        className="absolute inset-0 rounded-card"
      />

      <div className="pointer-events-none flex items-center gap-2.5">
        <span className="relative shrink-0">
          <Monogram
            name={account.nameInvestmentAccount}
            color={instrument.color}
            shape="square"
            size="md"
            className="size-[34px] rounded-[11px] text-[13px] lg:size-[34px]"
          />
          <span className="absolute -top-1.5 -left-1.5 lg:hidden [&>span]:size-[18px] [&_svg]:size-[11px]">
            {check}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="truncate text-[14px] font-semibold text-text">
            {account.nameInvestmentAccount}
          </span>
          <span className="truncate text-[12px] text-text-3">
            {t("investment.capitalShort", { amount: formatNumber(totals.investedAmount) })}
          </span>
        </span>
        {/* Phone: sparkline + value on the same row */}
        <InvestmentSparkline
          data={sparkline}
          color={instrument.color}
          className="h-7 w-14 shrink-0 lg:hidden"
        />
        <span className="flex shrink-0 flex-col items-end gap-px lg:hidden">
          <span className="font-num text-[14.5px] font-semibold text-text tabular">
            {formatNumber(totals.currentValue)}
          </span>
          <ProfitLossPill
            profitLoss={totals.profitLoss}
            percent={totals.profitLossPercent}
            className="bg-transparent px-0 py-0"
          />
        </span>
        <span className="hidden text-[12px] font-semibold text-text-3 tabular lg:inline">
          {Math.round(share)}%
        </span>
        <span className="hidden lg:block">{check}</span>
      </div>

      <div className="pointer-events-none hidden items-end justify-between gap-3 lg:flex">
        <span className="flex min-w-0 flex-col gap-2.5">
          <MoneyAmount
            value={totals.currentValue}
            symbolClassName="text-[13px] text-text-3"
            numberClassName="text-[24px] leading-[1.1] tracking-[-0.02em] text-text"
          />
          <ProfitLossPill
            profitLoss={totals.profitLoss}
            percent={totals.profitLossPercent}
            showAmount
            className="w-fit"
          />
        </span>
        <InvestmentSparkline
          data={sparkline}
          color={instrument.color}
          className="h-[52px] w-[128px] shrink-0"
        />
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2">
        <AccountAction icon={<LuPencil />} label={t("investment.edit")} onClick={onEdit} />
        <AccountAction
          icon={<LuArrowUpRight />}
          label={t("investment.withdrawShort")}
          onClick={onWithdraw}
        />
        <AccountAction
          icon={<LuTrendingUpDown />}
          label={t("investment.plShort")}
          onClick={onProfitLoss}
          primary
        />
      </div>
    </div>
  );
}

function AccountAction({
  icon,
  label,
  onClick,
  primary = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable flex h-[33px] items-center justify-center gap-1.5 rounded-full text-[12.5px] transition-colors duration-200 [&_svg]:size-3.5",
        primary
          ? "bg-primary font-semibold text-primary-fg hover:brightness-[1.06]"
          : "bg-surface-2 font-medium text-text-2 hover:bg-surface-3 hover:text-text",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
