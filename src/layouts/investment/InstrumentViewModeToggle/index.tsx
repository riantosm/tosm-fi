import { useTranslation } from "react-i18next";
import { HiOutlineSquares2X2, HiOutlineViewColumns } from "react-icons/hi2";
import { Tooltip } from "@/components/atoms/Tooltip";
import type { InstrumentViewMode } from "@/hooks/use-instrument-view-mode";
import { cn } from "@/utils/cn";

interface InstrumentViewModeToggleProps {
  value: InstrumentViewMode;
  onChange: (mode: InstrumentViewMode) => void;
}

export function InstrumentViewModeToggle({ value, onChange }: InstrumentViewModeToggleProps) {
  const { t } = useTranslation();
  const isGrid = value === "grid";

  return (
    <Tooltip content={t("investment.toggleInstrumentView")}>
      <button
        type="button"
        onClick={() => onChange(isGrid ? "carousel" : "grid")}
        aria-label={t("investment.toggleInstrumentView")}
        className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-ink-200 bg-ink-100 transition-colors dark:border-ink-700 dark:bg-ink-800"
      >
        <span
          className={cn(
            "absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-ink-900",
            isGrid && "translate-x-6",
          )}
        />
        <span className="relative z-10 flex flex-1 items-center justify-center">
          <HiOutlineViewColumns
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isGrid ? "text-ink-400 dark:text-ink-500" : "text-primary-600",
            )}
          />
        </span>
        <span className="relative z-10 flex flex-1 items-center justify-center">
          <HiOutlineSquares2X2
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isGrid ? "text-primary-600" : "text-ink-400 dark:text-ink-500",
            )}
          />
        </span>
      </button>
    </Tooltip>
  );
}
