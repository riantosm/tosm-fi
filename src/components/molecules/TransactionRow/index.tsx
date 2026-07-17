import { createElement } from "react";
import { HiOutlineScale, HiOutlineTag } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import type { Category, SubCategory } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface TransactionRowProps {
  transaction: Transaction;
  category: Category | undefined;
  subCategory: SubCategory | undefined;
  wallet: WalletAccount | undefined;
  onClick: () => void;
}

export function TransactionRow({
  transaction,
  category,
  subCategory,
  wallet,
  onClick,
}: TransactionRowProps) {
  const { format } = useCurrency();
  const isPositive =
    transaction.type === "income" ||
    (transaction.type === "correction" && transaction.amount >= 0);
  const Icon = category
    ? resolveCategoryIcon(category.icon)
    : transaction.type === "correction"
      ? HiOutlineScale
      : HiOutlineTag;
  const SubIcon = subCategory ? resolveCategoryIcon(subCategory.icon) : null;
  const title = transaction.title || subCategory?.nameSubCategory || category?.nameCategory || "-";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            !category && "bg-ink-100 dark:bg-ink-800",
          )}
          style={category ? { backgroundColor: `${category.color}26` } : undefined}
        >
          {createElement(Icon, { className: "h-5 w-5", style: { color: category?.color } })}
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
            {title}
          </Words>
          <div className="flex flex-wrap items-center gap-1.5">
            {wallet && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 dark:bg-ink-800">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: wallet.color }}
                />
                <Words type="xs/bold" as="span" className="text-ink-700 dark:text-ink-300">
                  {wallet.nameWallet}
                </Words>
              </span>
            )}
            {category && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${category.color}1A`, color: category.color }}
              >
                {createElement(Icon, { className: "size-4 shrink-0" })}
                <Words type="xs/bold" as="span">
                  {category.nameCategory}
                </Words>
              </span>
            )}
            {subCategory && SubIcon && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${category?.color}1A`, color: category?.color }}
              >
                {createElement(SubIcon, { className: "size-4 shrink-0" })}
                <Words type="xs/bold" as="span">
                  {subCategory.nameSubCategory}
                </Words>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span
          className={cn(
            "text-[10px] leading-none",
            isPositive ? "text-primary-600 dark:text-primary-400" : "text-red-500 dark:text-red-400",
          )}
        >
          {isPositive ? "▲" : "▼"}
        </span>
        <Words
          type="sm/bold"
          as="span"
          className={cn(
            "whitespace-nowrap",
            isPositive ? "text-primary-600 dark:text-primary-400" : "text-red-500 dark:text-red-400",
          )}
        >
          {format(Math.abs(transaction.amount))}
        </Words>
      </div>
    </button>
  );
}
