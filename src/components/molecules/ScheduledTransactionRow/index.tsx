import { createElement } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineTag } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import type { Category, SubCategory } from "@/types/category.types";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface ScheduledTransactionRowProps {
  occurrence: ScheduleOccurrence;
  category: Category | undefined;
  subCategory: SubCategory | undefined;
  wallet: WalletAccount | undefined;
  onPay: () => void;
  onCancel: () => void;
}

// A pending schedule occurrence rendered inline in the same list as real
// transactions (dashed border + "Terjadwal" badge to read as not-yet-real),
// with its own Bayar/Batal actions instead of the row-click-to-edit behavior
// TransactionRow has — this isn't an editable transaction yet.
export function ScheduledTransactionRow({
  occurrence,
  category,
  subCategory,
  wallet,
  onPay,
  onCancel,
}: ScheduledTransactionRowProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const isPositive = occurrence.type === "income";
  const Icon = category ? resolveCategoryIcon(category.icon) : HiOutlineTag;
  const SubIcon = subCategory ? resolveCategoryIcon(subCategory.icon) : null;
  const title = occurrence.title || subCategory?.nameSubCategory || category?.nameCategory || "-";

  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-ink-200 px-2 py-3 dark:border-ink-700">
      <div className="flex min-w-0 items-center gap-3 opacity-70">
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
          <div className="flex min-w-0 items-center gap-1.5">
            <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
              {title}
            </Words>
            <span className="shrink-0 rounded-full bg-ink-100 px-1.5 py-0.5 dark:bg-ink-800 flex">
              <Words type="xxs/bold" as="span" className="text-ink-500 dark:text-ink-400">
                {t("schedule.scheduledBadge")}
              </Words>
            </span>
          </div>
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

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Words
          type="sm/bold"
          as="span"
          className={cn(
            "whitespace-nowrap opacity-70",
            isPositive
              ? "text-primary-600 dark:text-primary-400"
              : "text-red-500 dark:text-red-400",
          )}
        >
          {format(occurrence.amount)}
        </Words>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-ink-100 px-2.5 py-1 text-ink-600 transition-colors hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700 flex"
          >
            <Words type="xxs/bold" as="span">
              {t("schedule.cancelButton")}
            </Words>
          </button>
          <button
            type="button"
            onClick={onPay}
            className="rounded-full bg-primary-600 px-2.5 py-1 text-white transition-colors hover:bg-primary-500 dark:bg-primary-500 dark:text-ink-950 dark:hover:bg-primary-400 flex"
          >
            <Words type="xxs/bold" as="span">
              {t("schedule.payButton")}
            </Words>
          </button>
        </div>
      </div>
    </div>
  );
}
