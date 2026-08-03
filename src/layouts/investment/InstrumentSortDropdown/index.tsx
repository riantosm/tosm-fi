import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowsUpDown, HiOutlineCheck } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { cn } from "@/utils/cn";

export type InstrumentSortOption = "amount" | "percentChange";

const SORT_OPTIONS: InstrumentSortOption[] = ["amount", "percentChange"];

interface InstrumentSortDropdownProps {
  value: InstrumentSortOption;
  onChange: (option: InstrumentSortOption) => void;
}

export function InstrumentSortDropdown({ value, onChange }: InstrumentSortDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <Tooltip content={t("investment.sortTitle")}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={t("investment.sortTitle")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
        >
          <HiOutlineArrowsUpDown className="h-4 w-4" />
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1 shadow-lg dark:border-ink-800 dark:bg-ink-900">
          {SORT_OPTIONS.map((option) => {
            const isActive = value === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-4 py-2.5 transition-colors",
                  isActive
                    ? "text-primary-700 dark:text-primary-400"
                    : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800",
                )}
              >
                <Words type={isActive ? "sm/bold" : "sm/regular"} as="span">
                  {t(`investment.sortOptions.${option}`)}
                </Words>
                {isActive && <HiOutlineCheck className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
