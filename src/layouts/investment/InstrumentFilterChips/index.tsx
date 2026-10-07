import { useTranslation } from "react-i18next";
import { Chip } from "@/components/molecules/Chip";
import { cn } from "@/utils/cn";
import type { Instrument } from "@/types/instrument.types";

interface InstrumentFilterChipsProps {
  instruments: Instrument[];
  /** Empty = every instrument (the "All" chip). */
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

/** Portfolio filter (multi-select). Scopes the hero chart, totals and instrument cards. */
export function InstrumentFilterChips({
  instruments,
  selectedIds,
  onChange,
  className,
}: InstrumentFilterChipsProps) {
  const { t } = useTranslation();
  const isAllSelected = selectedIds.length === 0;

  function toggleInstrument(idInstrument: string) {
    if (selectedIds.includes(idInstrument)) {
      onChange(selectedIds.filter((id) => id !== idInstrument));
    } else {
      onChange([...selectedIds, idInstrument]);
    }
  }

  return (
    <div
      className={cn(
        "-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-0.5 scrollbar-hide",
        className,
      )}
    >
      <Chip surface="page" size="sm" active={isAllSelected} onClick={() => onChange([])}>
        {t("common.all")}
      </Chip>
      {instruments.map((instrument) => (
        <Chip
          key={instrument.idInstrument}
          surface="page"
          size="sm"
          dot={instrument.color}
          active={selectedIds.includes(instrument.idInstrument)}
          onClick={() => toggleInstrument(instrument.idInstrument)}
        >
          {instrument.nameInstrument}
        </Chip>
      ))}
    </div>
  );
}
