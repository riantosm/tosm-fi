import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowsUpDown, HiOutlineCheck, HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import {
  DateRangeFilterPopover,
  type DateRangeFilter,
} from "@/layouts/transaction/DateRangeFilterPopover";
import { cn } from "@/utils/cn";

export type { DateRangeFilter } from "@/layouts/transaction/DateRangeFilterPopover";
export type TransactionSortOption = "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc";

const SORT_OPTIONS: TransactionSortOption[] = ["dateDesc", "dateAsc", "amountDesc", "amountAsc"];

interface TransactionToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRangeFilter;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onGoToCurrentMonth: () => void;
  sortOption: TransactionSortOption;
  onSortChange: (option: TransactionSortOption) => void;
  /** Change this value (e.g. to a fresh router location key) to force the search field open + focused, even if the component is already mounted. */
  focusSearchToken?: string;
}

export function TransactionToolbar({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onGoToCurrentMonth,
  sortOption,
  onSortChange,
  focusSearchToken = "",
}: TransactionToolbarProps) {
  const { t } = useTranslation();
  const [isSearchOpen, setIsSearchOpen] = useState(focusSearchToken !== "");
  const [lastFocusSearchToken, setLastFocusSearchToken] = useState(focusSearchToken);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const hasSortFilter = sortOption !== "dateDesc";

  if (focusSearchToken !== lastFocusSearchToken) {
    setLastFocusSearchToken(focusSearchToken);
    if (focusSearchToken !== "") setIsSearchOpen(true);
  }

  useEffect(() => {
    if (!isSortOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortOpen]);

  return (
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
              placeholder={t("transaction.searchPlaceholder")}
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
          <Tooltip content={t("transaction.searchPlaceholder")}>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t("transaction.searchPlaceholder")}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-500 dark:text-ink-400"
            >
              <HiOutlineMagnifyingGlass className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      <DateRangeFilterPopover dateRange={dateRange} onDateRangeChange={onDateRangeChange} />

      <div ref={sortRef} className="relative">
        <Tooltip content={t("transaction.sortTitle")}>
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            aria-label={t("transaction.sortTitle")}
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
              hasSortFilter
                ? "bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400"
                : "bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700",
            )}
          >
            <HiOutlineArrowsUpDown className="h-4 w-4" />
          </button>
        </Tooltip>

        {isSortOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1 shadow-lg dark:border-ink-800 dark:bg-ink-900">
            {SORT_OPTIONS.map((option) => {
              const isActive = sortOption === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onSortChange(option);
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 transition-colors",
                    isActive
                      ? "text-primary-700 dark:text-primary-400"
                      : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800",
                  )}
                >
                  <Words type={isActive ? "sm/bold" : "sm/regular"} as="span">
                    {t(`transaction.sortOptions.${option}`)}
                  </Words>
                  {isActive && <HiOutlineCheck className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onGoToCurrentMonth}
        className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-ink-100 px-3 py-2 text-ink-600 transition-colors hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700 flex items-center justify-center"
      >
        <Words type="xs/bold" as="span">
          {t("transaction.goToCurrentMonth")}
        </Words>
      </button>
    </div>
  );
}
