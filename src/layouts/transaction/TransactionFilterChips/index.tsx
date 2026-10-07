import { createElement, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import {
  LuArrowDownLeft,
  LuArrowLeftRight,
  LuArrowUpRight,
  LuLayers,
  LuScale,
} from "react-icons/lu";
import { Chip } from "@/components/molecules/Chip";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category } from "@/types/category.types";
import type { TransactionType } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

export type TransactionTypeFilter = TransactionType | "all";

const TYPE_FILTERS: {
  value: Exclude<TransactionTypeFilter, "all">;
  labelKey: string;
  icon: ReactNode;
}[] = [
  { value: "expense", labelKey: "transaction.expense", icon: <LuArrowUpRight /> },
  { value: "income", labelKey: "transaction.income", icon: <LuArrowDownLeft /> },
  { value: "transfer", labelKey: "transaction.transfer", icon: <LuArrowLeftRight /> },
  { value: "correction", labelKey: "transaction.balanceCorrection", icon: <LuScale /> },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface TransactionFilterChipsProps {
  wallets: WalletAccount[];
  categories: Category[];
  selectedType: TransactionTypeFilter;
  onSelectType: (type: TransactionTypeFilter) => void;
  selectedWalletId: string;
  onSelectWallet: (id: string) => void;
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  selectedSubCategoryId: string;
  onSelectSubCategory: (id: string) => void;
  /** Search / date-range filters to list next to the chip filters in the "active" summary. */
  extraActiveFilters?: ActiveFilterChip[];
  /** Total matches for the current filters (shown in the active summary). */
  matchCount?: number | null;
  onReset?: () => void;
}

/** One labelled row of chips: a label column on desktop, a horizontal scroller on phones. */
function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 lg:items-start">
      <span className="hidden w-[100px] shrink-0 pt-[9px] text-[12px] leading-none font-semibold tracking-[0.04em] text-text-3 uppercase lg:block">
        {label}
      </span>
      <div className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 scrollbar-hide sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        {children}
      </div>
    </div>
  );
}

export function TransactionFilterChips({
  wallets,
  categories,
  selectedType,
  onSelectType,
  selectedWalletId,
  onSelectWallet,
  selectedCategoryId,
  onSelectCategory,
  selectedSubCategoryId,
  onSelectSubCategory,
  extraActiveFilters = [],
  matchCount,
  onReset,
}: TransactionFilterChipsProps) {
  const { t } = useTranslation();
  const selectedCategory =
    selectedCategoryId === "all"
      ? undefined
      : categories.find((category) => category.idCategory === selectedCategoryId);

  // Keep the last category's subcategories rendered while the row animates closed.
  const [renderedCategory, setRenderedCategory] = useState(selectedCategory);
  if (selectedCategory && renderedCategory !== selectedCategory) {
    setRenderedCategory(selectedCategory);
  }

  const selectedWallet = wallets.find((wallet) => wallet.idWallet === selectedWalletId);
  const selectedSub = selectedCategory?.subCategories.find(
    (sub) => sub.idSubCategory === selectedSubCategoryId,
  );
  const typeFilter = TYPE_FILTERS.find((item) => item.value === selectedType);

  const activeFilters: ActiveFilterChip[] = [
    ...(selectedWallet
      ? [{ key: "wallet", label: selectedWallet.nameWallet, onRemove: () => onSelectWallet("all") }]
      : []),
    ...(typeFilter
      ? [{ key: "type", label: t(typeFilter.labelKey), onRemove: () => onSelectType("all") }]
      : []),
    ...(selectedCategory
      ? [
          {
            key: "category",
            label: selectedCategory.nameCategory,
            onRemove: () => onSelectCategory("all"),
          },
        ]
      : []),
    ...(selectedSub
      ? [
          {
            key: "sub",
            label: selectedSub.nameSubCategory,
            onRemove: () => onSelectSubCategory("all"),
          },
        ]
      : []),
    ...extraActiveFilters,
  ];
  const hasActive = activeFilters.length > 0;

  // Inactive chips sit on the page background on phones (white + stroke) and inside the card on desktop.
  const inactiveClass = "max-lg:border-border max-lg:bg-surface";
  const chip = (
    key: string,
    isActive: boolean,
    onClick: () => void,
    children: ReactNode,
    extra?: { dot?: string; icon?: ReactNode },
  ) => (
    <Chip
      key={key}
      size="sm"
      active={isActive}
      dot={extra?.dot}
      icon={extra?.icon}
      onClick={onClick}
      className={cn("max-w-[200px]", !isActive && inactiveClass)}
    >
      {children}
    </Chip>
  );
  const allLabel = (phoneKey: string) => (
    <>
      <span className="lg:hidden">{t(phoneKey)}</span>
      <span className="hidden lg:inline">{t("common.all")}</span>
    </>
  );

  return (
    <div className="flex flex-col gap-2.5 lg:gap-3 lg:rounded-card lg:bg-surface lg:px-5 lg:py-4 lg:shadow-card">
      <FilterRow label={t("transaction.filterWallet")}>
        {chip(
          "all",
          selectedWalletId === "all",
          () => onSelectWallet("all"),
          allLabel("transaction.allWallets"),
        )}
        {wallets.map((wallet) =>
          chip(
            wallet.idWallet,
            selectedWalletId === wallet.idWallet,
            () => onSelectWallet(wallet.idWallet),
            wallet.nameWallet,
            {
              dot: wallet.color,
            },
          ),
        )}
      </FilterRow>

      <FilterRow label={t("transaction.filterType")}>
        {chip(
          "all",
          selectedType === "all",
          () => onSelectType("all"),
          allLabel("transaction.allTypes"),
        )}
        {TYPE_FILTERS.map((filter) =>
          chip(
            filter.value,
            selectedType === filter.value,
            () => onSelectType(filter.value),
            t(filter.labelKey),
            {
              icon: filter.icon,
            },
          ),
        )}
      </FilterRow>

      <FilterRow label={t("transaction.filterCategory")}>
        {chip(
          "all",
          selectedCategoryId === "all",
          () => onSelectCategory("all"),
          allLabel("transaction.allCategories"),
        )}
        {categories.map((category) =>
          chip(
            category.idCategory,
            selectedCategoryId === category.idCategory,
            () => onSelectCategory(category.idCategory),
            category.nameCategory,
            { icon: createElement(resolveCategoryIcon(category.icon)) },
          ),
        )}
      </FilterRow>

      <AnimatePresence initial={false}>
        {selectedCategory && renderedCategory && renderedCategory.subCategories.length > 0 && (
          <m.div
            key="sub"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <FilterRow label={t("transaction.filterSubCategory")}>
              {chip(
                "all",
                selectedSubCategoryId === "all",
                () => onSelectSubCategory("all"),
                <>
                  <span className="lg:hidden">{t("transaction.allSub")}</span>
                  <span className="hidden lg:inline">{t("common.all")}</span>
                </>,
                { icon: <LuLayers /> },
              )}
              {renderedCategory.subCategories.map((sub) =>
                chip(
                  sub.idSubCategory,
                  selectedSubCategoryId === sub.idSubCategory,
                  () => onSelectSubCategory(sub.idSubCategory),
                  sub.nameSubCategory,
                  {
                    icon: createElement(resolveCategoryIcon(sub.icon)),
                  },
                ),
              )}
            </FilterRow>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {hasActive && (
          <m.div
            key="active"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            {/* Phone: one compact banner */}
            <div className="flex items-center gap-3 rounded-control bg-primary-soft px-3.5 py-2.5 lg:hidden">
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-primary-text">
                {[
                  matchCount !== undefined && matchCount !== null
                    ? t("transaction.matchCountShort", { count: matchCount })
                    : null,
                  activeFilters.map((item) => item.label).join(" › "),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="shrink-0 text-[13px] font-semibold text-primary-text"
                >
                  {t("transaction.reset")}
                </button>
              )}
            </div>

            {/* Desktop: summary row under a divider */}
            <div className="hidden items-center gap-2 border-t border-border pt-3.5 lg:flex">
              {matchCount !== undefined && matchCount !== null && (
                <span className="mr-1 shrink-0 text-[13px] font-semibold text-text-2">
                  {t("transaction.matchCount", { count: matchCount })}
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                {activeFilters.map((item) => (
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
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="shrink-0 text-[13px] font-semibold text-primary-text transition-colors hover:text-primary"
                >
                  {t("transaction.resetFilter")}
                </button>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
