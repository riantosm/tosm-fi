import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { LuSearch, LuX } from "react-icons/lu";
import { cn } from "@/utils/cn";

export type TransactionSortOption = "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc";

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
