import { createElement } from "react";
import { LuScale, LuTag } from "react-icons/lu";
import { TxRowBase } from "@/components/molecules/TxRowBase";
import { formatTxTime } from "@/utils/tx-time";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import type { Category, SubCategory } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

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
  const { language } = useLanguage();
  const isCorrection = transaction.type === "correction";
  const isPositive = transaction.type === "income" || (isCorrection && transaction.amount >= 0);
  const Icon = category ? resolveCategoryIcon(category.icon) : isCorrection ? LuScale : LuTag;
  const title = transaction.title || subCategory?.nameSubCategory || category?.nameCategory || "-";
  const metaParts = [
    subCategory
      ? `${category?.nameCategory ?? ""} › ${subCategory.nameSubCategory}`
      : category?.nameCategory,
    wallet?.nameWallet,
  ].filter(Boolean);

  return (
    <TxRowBase
      onClick={onClick}
      icon={createElement(Icon)}
      color={category?.color ?? (isCorrection ? "#8A94A0" : undefined)}
      title={title}
      meta={metaParts.join(" · ")}
      amount={`${isPositive ? "+" : "−"}${format(Math.abs(transaction.amount))}`}
      amountTone={isPositive ? "income" : "expense"}
      caption={formatTxTime(transaction.date, language)}
    />
  );
}
