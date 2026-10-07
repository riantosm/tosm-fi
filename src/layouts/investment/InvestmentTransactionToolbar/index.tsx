import { useTranslation } from "react-i18next";
import { Chip } from "@/components/molecules/Chip";
import { cn } from "@/utils/cn";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransactionType } from "@/types/investment-transaction.types";

const TYPES: InvestmentTransactionType[] = ["in", "out", "transfer", "pl"];

export type InvestmentTypeFilter = InvestmentTransactionType | "all";

interface InvestmentFilterChipsProps {
  typeFilter: InvestmentTypeFilter;
  onTypeFilterChange: (type: InvestmentTypeFilter) => void;
  /** Adds single-select instrument chips after a divider (main ledger only). */
  instruments?: Instrument[];
  instrumentFilter?: string;
  onInstrumentFilterChange?: (idInstrument: string) => void;
  /** page = chips sit on the page background (phone); card = inside a card. */
  surface?: "page" | "card";
  className?: string;
}

/** Ledger filters: type (Semua / Uang masuk / Uang keluar / Transfer / P/L) and optionally instrument. */
export function InvestmentFilterChips({
  typeFilter,
  onTypeFilterChange,
  instruments,
  instrumentFilter = "all",
  onInstrumentFilterChange,
  surface = "card",
  className,
}: InvestmentFilterChipsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 py-0.5 scrollbar-hide",
        className,
      )}
    >
      <Chip
        size="sm"
        surface={surface}
        active={typeFilter === "all"}
        onClick={() => onTypeFilterChange("all")}
      >
        {t("common.all")}
      </Chip>
      {TYPES.map((type) => (
        <Chip
          key={type}
          size="sm"
          surface={surface}
          active={typeFilter === type}
          onClick={() => onTypeFilterChange(typeFilter === type ? "all" : type)}
        >
          <span className="lg:hidden">{t(`investment.typeShort.${type}`)}</span>
          <span className="hidden lg:inline">{t(`investment.typeFilter.${type}`)}</span>
        </Chip>
      ))}
      {instruments && onInstrumentFilterChange && instruments.length > 1 && (
        <>
          <span className="mx-0.5 h-[22px] w-px shrink-0 bg-border" aria-hidden="true" />
          {instruments.map((instrument) => {
            const isActive = instrumentFilter === instrument.idInstrument;
            return (
              <Chip
                key={instrument.idInstrument}
                size="sm"
                surface={surface}
                dot={instrument.color}
                active={isActive}
                onClick={() => onInstrumentFilterChange(isActive ? "all" : instrument.idInstrument)}
              >
                {instrument.nameInstrument}
              </Chip>
            );
          })}
        </>
      )}
    </div>
  );
}
