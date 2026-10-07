import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LuPlus } from "react-icons/lu";
import { Monogram } from "@/components/atoms/Monogram";
import { Card } from "@/components/molecules/Card";
import { InvestmentSparkline } from "@/layouts/investment/InvestmentSparkline";
import { MoneyAmount } from "@/layouts/investment/MoneyAmount";
import { ProfitLossPill } from "@/layouts/investment/ProfitLossPill";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { getInstrumentTotals } from "@/utils/investment";
import { cn } from "@/utils/cn";
import type { Instrument } from "@/types/instrument.types";
import type { TimelinePoint } from "@/types/investment-transaction.types";

function activeAccountCount(instrument: Instrument): number {
  return instrument.investmentAccounts.filter((account) => !account.isDeleted).length;
}

interface InstrumentCardProps {
  instrument: Instrument;
  sparkline: TimelinePoint[];
  /** carousel = fixed width in a horizontal scroll row; grid = fills its grid cell. */
  layout?: "carousel" | "grid";
  onOpen: () => void;
}

/** Desktop instrument card: solid monogram, value, P/L pill and a bleeding sparkline. */
export function InstrumentCard({
  instrument,
  sparkline,
  layout = "grid",
  onOpen,
}: InstrumentCardProps) {
  const { t } = useTranslation();
  const totals = useMemo(() => getInstrumentTotals(instrument), [instrument]);

  return (
    <Card
      as="button"
      onClick={onOpen}
      interactive
      padding="none"
      className={cn(
        "flex flex-col gap-3.5 overflow-hidden px-5 pt-5 text-left",
        layout === "carousel" ? "w-[300px] shrink-0 snap-start" : "w-full",
      )}
    >
      <div className="flex w-full items-center gap-2.5">
        <Monogram
          name={instrument.nameInstrument}
          color={instrument.color}
          variant="solid"
          shape="square"
          size="md"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="truncate text-[14px] font-semibold text-text">
            {instrument.nameInstrument}
          </span>
          <span className="truncate text-[12px] text-text-3">
            {t("investment.accountsShort", { count: activeAccountCount(instrument) })}
          </span>
        </span>
        <ProfitLossPill profitLoss={totals.profitLoss} percent={totals.profitLossPercent} />
      </div>
      <MoneyAmount
        value={totals.currentValue}
        symbolClassName="text-[14px] font-medium text-text-3"
        numberClassName="text-[26px] leading-[1.15] tracking-[-0.02em] text-text"
      />
      <InvestmentSparkline
        data={sparkline}
        color={instrument.color}
        className="-mx-5 h-14 w-[calc(100%+40px)]"
      />
    </Card>
  );
}

interface InstrumentListRowProps {
  instrument: Instrument;
  sparkline: TimelinePoint[];
  onOpen: () => void;
}

/** Phone instrument row: monogram, name, mini sparkline, value + P/L %. */
export function InstrumentListRow({ instrument, sparkline, onOpen }: InstrumentListRowProps) {
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const totals = useMemo(() => getInstrumentTotals(instrument), [instrument]);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 py-3 text-left transition-opacity active:opacity-70"
    >
      <Monogram
        name={instrument.nameInstrument}
        color={instrument.color}
        variant="solid"
        shape="square"
        size="md"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-[14.5px] font-semibold text-text">
          {instrument.nameInstrument}
        </span>
        <span className="truncate text-[12px] text-text-3">
          {t("investment.accountsShort", { count: activeAccountCount(instrument) })}
        </span>
      </span>
      <InvestmentSparkline
        data={sparkline}
        color={instrument.color}
        lineOnly
        className="h-7 w-16 shrink-0"
      />
      <span className="flex shrink-0 flex-col items-end gap-px">
        <span className="font-num text-[14.5px] font-semibold text-text tabular">
          {formatNumber(totals.currentValue)}
        </span>
        <ProfitLossPill
          profitLoss={totals.profitLoss}
          percent={totals.profitLossPercent}
          className="bg-transparent px-0 py-0"
        />
      </span>
    </button>
  );
}

interface AddInstrumentTileProps {
  onClick: () => void;
  /** Defaults to "Tambah instrumen" (also used for "Tambah akun"). */
  label?: string;
  layout?: "carousel" | "grid";
  className?: string;
}

/** "Tambah instrumen" tile at the end of the card row. */
export function AddInstrumentTile({
  onClick,
  label,
  layout = "grid",
  className,
}: AddInstrumentTileProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[168px] flex-col items-center justify-center gap-2.5 rounded-card border border-border bg-surface/40 transition-colors duration-300 hover:border-primary hover:bg-primary-soft/40",
        layout === "carousel" ? "w-[240px] shrink-0 snap-start" : "w-full",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-text transition-transform duration-300 group-hover:scale-110">
        <LuPlus className="size-5" />
      </span>
      <span className="text-[14px] font-semibold text-primary-text">
        {label ?? t("investment.addInstrument")}
      </span>
    </button>
  );
}
