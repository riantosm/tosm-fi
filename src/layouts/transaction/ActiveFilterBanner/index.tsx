import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuSlidersHorizontal } from "react-icons/lu";
import { Chip } from "@/components/molecules/Chip";
import {
  DEFAULT_FILTERS,
  EMPTY_RANGE,
  TYPE_FILTERS,
  formatRangeLabel,
  type TransactionFilters,
} from "@/layouts/transaction/transaction-filters";
import type { Category } from "@/types/category.types";
import type { WalletAccount } from "@/types/wallet.types";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ActiveFilterBannerProps {
  filters: TransactionFilters;
  search: string;
  wallets: WalletAccount[];
  categories: Category[];
  locale: string;
  matchCount: number | null;
  /** Tapping the summary opens the filter sheet. */
  onOpen: () => void;
  onChange: (patch: Partial<TransactionFilters>) => void;
  onClearSearch: () => void;
  onReset: () => void;
}

/**
 * Active-filter summary under the summary bar. Phones: one tappable line
 * ("9 transaksi · Pengeluaran › Makan") + Reset. Desktop: removable chips per filter.
 */
export function ActiveFilterBanner({
  filters,
  search,
  wallets,
  categories,
  locale,
  matchCount,
  onOpen,
  onChange,
  onClearSearch,
  onReset,
}: ActiveFilterBannerProps) {
  const { t } = useTranslation();
  const wallet = wallets.find((item) => item.idWallet === filters.walletId);
  const typeFilter = TYPE_FILTERS.find((item) => item.value === filters.type);
  const category = categories.find((item) => item.idCategory === filters.categoryId);
  const sub = category?.subCategories.find((item) => item.idSubCategory === filters.subCategoryId);
  const rangeLabel = formatRangeLabel(filters.range, locale);

  const items = [
    wallet && {
      key: "wallet",
      label: wallet.nameWallet,
      onRemove: () => onChange({ walletId: "all" }),
    },
    typeFilter && {
      key: "type",
      label: t(typeFilter.labelKey),
      onRemove: () => onChange({ type: "all" }),
    },
    category && {
      key: "category",
      label: category.nameCategory,
      onRemove: () => onChange({ categoryId: "all", subCategoryId: "all" }),
    },
    sub && {
      key: "sub",
      label: sub.nameSubCategory,
      onRemove: () => onChange({ subCategoryId: "all" }),
    },
    search && { key: "search", label: `“${search}”`, onRemove: onClearSearch },
    rangeLabel && {
      key: "date",
      label: rangeLabel,
      onRemove: () => onChange({ range: EMPTY_RANGE }),
    },
    filters.sort !== DEFAULT_FILTERS.sort && {
      key: "sort",
      label: t(`transaction.sortShort.${filters.sort}`),
      onRemove: () => onChange({ sort: DEFAULT_FILTERS.sort }),
    },
  ].filter((item) => Boolean(item)) as { key: string; label: string; onRemove: () => void }[];

  return (
    <AnimatePresence initial={false}>
      {items.length > 0 && (
        <m.div
          key="active"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="overflow-hidden"
        >
          {/* Phone: one compact tappable line */}
          <div className="flex items-center gap-3 rounded-control bg-primary-soft px-3.5 py-2.5 lg:hidden">
            <button
              type="button"
              onClick={onOpen}
              className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold text-primary-text"
            >
              {[
                matchCount !== null
                  ? t("transaction.matchCountShort", { count: matchCount })
                  : null,
                items.map((item) => item.label).join(" › "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="shrink-0 text-[13px] font-semibold text-primary-text"
            >
              {t("transaction.reset")}
            </button>
          </div>

          {/* Desktop: count + removable chips */}
          <div className="hidden items-center gap-2 rounded-card bg-surface px-5 py-3 shadow-card lg:flex">
            {matchCount !== null && (
              <span className="mr-1 shrink-0 text-[13px] font-semibold text-text-2">
                {t("transaction.matchCount", { count: matchCount })}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {items.map((item) => (
                <Chip
                  key={item.key}
                  size="sm"
                  removable
                  onClick={item.onRemove}
                  className="max-w-[220px]"
                >
                  {item.label}
                </Chip>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpen}
              className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-text-2 transition-colors hover:text-text"
            >
              <LuSlidersHorizontal className="size-3.5" />
              {t("transaction.filterTitle")}
            </button>
            <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
            <button
              type="button"
              onClick={onReset}
              className="shrink-0 text-[13px] font-semibold text-primary-text transition-colors hover:text-primary"
            >
              {t("transaction.resetFilter")}
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
