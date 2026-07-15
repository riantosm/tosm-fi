import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { cn } from "@/utils/cn";
import type { Instrument } from "@/types/instrument.types";
import type { InvestmentTransactionType } from "@/types/investment-transaction.types";

const TYPES: InvestmentTransactionType[] = ["in", "out", "transfer", "pl"];

interface InvestmentTransactionToolbarProps {
  instruments: Instrument[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: InvestmentTransactionType | "all";
  onTypeFilterChange: (type: InvestmentTransactionType | "all") => void;
  instrumentFilter: string;
  onInstrumentFilterChange: (idInstrument: string) => void;
}

export function InvestmentTransactionToolbar({
  instruments,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  instrumentFilter,
  onInstrumentFilterChange,
}: InvestmentTransactionToolbarProps) {
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-9 shrink-0 items-center overflow-hidden rounded-full border transition-[width] duration-300 ease-out",
            isSearchOpen
              ? "w-40 border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900 sm:w-56"
              : "w-9 border-transparent bg-ink-100 dark:bg-ink-800",
          )}
        >
          {isSearchOpen ? (
            <div className="flex w-full items-center gap-1.5 px-2.5">
              <HiOutlineMagnifyingGlass className="h-4 w-4 shrink-0 text-ink-400 dark:text-ink-500" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={t("investment.searchPlaceholder")}
                className="w-full min-w-0 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none dark:text-ink-100 dark:placeholder:text-ink-500"
              />
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  setIsSearchOpen(false);
                }}
                className="shrink-0 text-ink-400 hover:text-ink-600 dark:text-ink-500 dark:hover:text-ink-300"
              >
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t("investment.searchPlaceholder")}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-500 dark:text-ink-400"
            >
              <HiOutlineMagnifyingGlass className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-1 gap-1.5 overflow-x-auto scrollbar-hide h-fit">
          <button
            type="button"
            onClick={() => onTypeFilterChange("all")}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-2 flex items-center transition-colors",
              typeFilter === "all"
                ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700",
            )}
          >
            <Words type="xs/bold" as="span" className="whitespace-nowrap">
              {t("common.all")}
            </Words>
          </button>
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeFilterChange(type)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-2 flex items-center transition-colors",
                typeFilter === type
                  ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700",
              )}
            >
              <Words type="xs/bold" as="span" className="whitespace-nowrap">
                {t(`investment.type.${type}`)}
              </Words>
            </button>
          ))}
        </div>
      </div>

      {instruments.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => onInstrumentFilterChange("all")}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-2 flex items-center transition-colors",
              instrumentFilter === "all"
                ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700",
            )}
          >
            <Words type="xs/bold" as="span" className="whitespace-nowrap">
              {t("common.all")}
            </Words>
          </button>
          {instruments.map((instrument) => {
            const isSelected = instrumentFilter === instrument.idInstrument;
            return (
              <button
                key={instrument.idInstrument}
                type="button"
                onClick={() => onInstrumentFilterChange(instrument.idInstrument)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-2 flex items-center transition-colors",
                  isSelected
                    ? undefined
                    : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700",
                )}
                style={
                  isSelected
                    ? { backgroundColor: `${instrument.color}26`, color: instrument.color }
                    : undefined
                }
              >
                <Words type="xs/bold" as="span" className="whitespace-nowrap">
                  {instrument.nameInstrument}
                </Words>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
