import { forwardRef, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  LuArrowDownWideNarrow,
  LuArrowUpNarrowWide,
  LuCalendarArrowDown,
  LuCalendarArrowUp,
  LuCheck,
  LuChevronDown,
  LuListFilter,
  LuSearch,
  LuX,
} from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { Popover } from "@/components/molecules/Popover";
import { cn } from "@/utils/cn";

export type { DateRangeFilter } from "@/layouts/transaction/DateRangeFilterPopover";
export type TransactionSortOption = "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc";

const SORT_OPTIONS: {
  value: TransactionSortOption;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { value: "dateDesc", icon: LuCalendarArrowDown },
  { value: "dateAsc", icon: LuCalendarArrowUp },
  { value: "amountDesc", icon: LuArrowDownWideNarrow },
  { value: "amountAsc", icon: LuArrowUpNarrowWide },
];

interface TransactionSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  /** Defaults to "Cari judul atau catatan". */
  placeholder?: string;
  className?: string;
}

/** Pill search input ("Cari judul atau catatan") with a clear button. */
export const TransactionSearchField = forwardRef<HTMLInputElement, TransactionSearchFieldProps>(
  function TransactionSearchField({ value, onChange, autoFocus, placeholder, className }, ref) {
    const { t } = useTranslation();
    const label = placeholder ?? t("transaction.searchPlaceholder");
    return (
      <label
        className={cn(
          "group flex h-[38px] items-center gap-2.5 rounded-full border border-border bg-surface px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]",
          className,
        )}
      >
        <LuSearch className="size-4 shrink-0 text-text-3" />
        <input
          ref={ref}
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          aria-label={label}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] text-text outline-none placeholder:text-text-3"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t("common.close")}
            className="flex size-5 shrink-0 animate-scale-in items-center justify-center rounded-full bg-surface-2 text-text-3 hover:text-text"
          >
            <LuX className="size-3" />
          </button>
        )}
      </label>
    );
  },
);

interface TransactionSortMenuProps {
  value: TransactionSortOption;
  onChange: (value: TransactionSortOption) => void;
  /** pill = labelled desktop button; icon = round phone app-bar button. */
  variant?: "pill" | "icon";
  align?: "start" | "end";
}

/** "Urutkan" — trigger + sort option list (popover on desktop, sheet on phones). */
export function TransactionSortMenu({
  value,
  onChange,
  variant = "pill",
  align = "start",
}: TransactionSortMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isCustom = value !== "dateDesc";

  const trigger =
    variant === "icon" ? (
      <IconButton
        label={t("transaction.sortTitle")}
        icon={<LuListFilter />}
        variant="surface"
        size="lg"
        tooltip={false}
        className={cn(isCustom && "bg-primary-soft text-primary-text")}
        onClick={() => setIsOpen((prev) => !prev)}
      />
    ) : (
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={t("transaction.sortTitle")}
        className={cn(
          "pressable flex h-[38px] items-center gap-2 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors",
          isCustom
            ? "border-primary bg-primary-soft text-primary-text"
            : "border-border bg-surface text-text-2 hover:bg-surface-2 hover:text-text",
        )}
      >
        <LuListFilter className="size-4 shrink-0" />
        {t(`transaction.sortShort.${value}`)}
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
      align={align}
      panelClassName="w-[280px]"
    >
      <div className="flex flex-col gap-0.5">
        <span className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-text-3 uppercase">
          {t("transaction.sortTitle")}
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
              <span className="flex-1">{t(`transaction.sortOptions.${option}`)}</span>
              {isActive && <LuCheck className="size-4 shrink-0 animate-scale-in" />}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
