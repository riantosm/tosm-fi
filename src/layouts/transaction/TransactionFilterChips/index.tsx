import { useState } from "react";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import { Words } from "@/components/atoms/Words";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category } from "@/types/category.types";
import type { TransactionType } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

export type TransactionTypeFilter = TransactionType | "all";

const TYPE_FILTERS: { value: TransactionTypeFilter; labelKey: string }[] = [
  { value: "all", labelKey: "common.all" },
  { value: "expense", labelKey: "transaction.expense" },
  { value: "income", labelKey: "transaction.income" },
  { value: "transfer", labelKey: "transaction.transfer" },
];

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
}

interface CategoryChipProps {
  label: string;
  icon?: IconType;
  color?: string;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryChip({ label, icon: Icon, color, isSelected, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 transition-colors",
        isSelected
          ? color
            ? undefined
            : "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
          : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700",
      )}
      style={isSelected && color ? { backgroundColor: `${color}26`, color } : undefined}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <Words type="xs/bold" as="span" className="whitespace-nowrap">
        {label}
      </Words>
    </button>
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
}: TransactionFilterChipsProps) {
  const { t } = useTranslation();
  const selectedCategory =
    selectedCategoryId === "all"
      ? undefined
      : categories.find((category) => category.idCategory === selectedCategoryId);

  const [renderedCategory, setRenderedCategory] = useState(selectedCategory);
  if (selectedCategory && renderedCategory !== selectedCategory) {
    setRenderedCategory(selectedCategory);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => onSelectWallet("all")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2 transition-colors",
            selectedWalletId === "all"
              ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
              : "border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800",
          )}
        >
          <Words
            type="sm/bold"
            as="span"
            className="whitespace-nowrap text-ink-800 dark:text-ink-200"
          >
            {t("common.all")}
          </Words>
        </button>
        {wallets.map((wallet) => {
          const isSelected = selectedWalletId === wallet.idWallet;

          return (
            <button
              key={wallet.idWallet}
              type="button"
              onClick={() => onSelectWallet(wallet.idWallet)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2 transition-colors",
                isSelected
                  ? "bg-ink-50 dark:bg-ink-800"
                  : "border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800",
              )}
              style={isSelected ? { borderColor: wallet.color } : undefined}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: wallet.color }}
              />
              <Words
                type="sm/bold"
                as="span"
                className="whitespace-nowrap text-ink-800 dark:text-ink-200"
              >
                {wallet.nameWallet}
              </Words>
            </button>
          );
        })}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TYPE_FILTERS.map((filter) => (
          <CategoryChip
            key={filter.value}
            label={t(filter.labelKey)}
            isSelected={selectedType === filter.value}
            onClick={() => onSelectType(filter.value)}
          />
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <CategoryChip
          label={t("common.all")}
          isSelected={selectedCategoryId === "all"}
          onClick={() => onSelectCategory("all")}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category.idCategory}
            label={category.nameCategory}
            icon={resolveCategoryIcon(category.icon)}
            color={category.color}
            isSelected={selectedCategoryId === category.idCategory}
            onClick={() => onSelectCategory(category.idCategory)}
          />
        ))}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          selectedCategory ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {renderedCategory && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-hide">
              <CategoryChip
                label={t("common.all")}
                isSelected={selectedSubCategoryId === "all"}
                onClick={() => onSelectSubCategory("all")}
              />
              {renderedCategory.subCategories.map((sub) => (
                <CategoryChip
                  key={sub.idSubCategory}
                  label={sub.nameSubCategory}
                  icon={resolveCategoryIcon(sub.icon)}
                  color={renderedCategory.color}
                  isSelected={selectedSubCategoryId === sub.idSubCategory}
                  onClick={() => onSelectSubCategory(sub.idSubCategory)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
