import { useTranslation } from "react-i18next";
import { Words } from "@/components/atoms/Words";
import { cn } from "@/utils/cn";
import type { Instrument } from "@/types/instrument.types";

interface InstrumentFilterChipsProps {
  instruments: Instrument[];
  /** Empty = every instrument (the "All" chip). */
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function InstrumentFilterChips({
  instruments,
  selectedIds,
  onChange,
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
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2 transition-colors",
          isAllSelected
            ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
            : "border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800",
        )}
      >
        <Words type="sm/bold" as="span" className="whitespace-nowrap text-ink-800 dark:text-ink-200">
          {t("common.all")}
        </Words>
      </button>
      {instruments.map((instrument) => {
        const isSelected = selectedIds.includes(instrument.idInstrument);
        return (
          <button
            key={instrument.idInstrument}
            type="button"
            onClick={() => toggleInstrument(instrument.idInstrument)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2 transition-colors",
              isSelected
                ? "bg-ink-50 dark:bg-ink-800"
                : "border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800",
            )}
            style={isSelected ? { borderColor: instrument.color } : undefined}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: instrument.color }}
            />
            <Words type="sm/bold" as="span" className="whitespace-nowrap text-ink-800 dark:text-ink-200">
              {instrument.nameInstrument}
            </Words>
          </button>
        );
      })}
    </div>
  );
}
