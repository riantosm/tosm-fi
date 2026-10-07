import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import {
  LuArrowDownWideNarrow,
  LuBanknote,
  LuCheck,
  LuChevronDown,
  LuPercent,
} from "react-icons/lu";
import { Popover } from "@/components/molecules/Popover";
import { cn } from "@/utils/cn";

export type InstrumentSortOption = "amount" | "percentChange";

const SORT_OPTIONS: { value: InstrumentSortOption; icon: IconType }[] = [
  { value: "amount", icon: LuBanknote },
  { value: "percentChange", icon: LuPercent },
];

interface InstrumentSortMenuProps {
  value: InstrumentSortOption;
  onChange: (value: InstrumentSortOption) => void;
  /** pill = bordered desktop button; text = compact "⇣ Nilai" link (phone section header). */
  variant?: "pill" | "text";
}

/** "Urutkan" for instrument cards — always highest first, by value or by P/L %. */
export function InstrumentSortMenu({ value, onChange, variant = "pill" }: InstrumentSortMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const trigger =
    variant === "text" ? (
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={t("investment.sortTitle")}
        className="flex items-center gap-1.5 text-[13px] text-text-2 transition-colors hover:text-text"
      >
        <LuArrowDownWideNarrow className="size-4" />
        {t(`investment.sortShort.${value}`)}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={t("investment.sortTitle")}
        className="pressable flex h-[38px] items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[13px] text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
      >
        <LuArrowDownWideNarrow className="size-[15px] shrink-0" />
        {t(`investment.sortOptions.${value}`)}
        <LuChevronDown
          className={cn(
            "size-3.5 shrink-0 text-text-3 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
    );

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={trigger}
      align="end"
      panelClassName="w-[300px]"
    >
      <div className="flex flex-col gap-0.5">
        <span className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-text-3 uppercase">
          {t("investment.sortTitle")}
        </span>
        {SORT_OPTIONS.map(({ value: option, icon: Icon }) => {
          const isActive = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              aria-pressed={isActive}
              className={cn(
                "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-[14px] transition-colors duration-200",
                isActive
                  ? "bg-primary-soft font-semibold text-primary-text"
                  : "text-text hover:bg-surface-2",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0",
                  isActive ? "text-primary-text" : "text-text-2",
                )}
              />
              <span className="flex-1">{t(`investment.sortOptions.${option}`)}</span>
              {isActive && <LuCheck className="size-4 shrink-0 animate-scale-in" />}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
