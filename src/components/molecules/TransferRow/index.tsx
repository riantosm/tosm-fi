import { HiOutlineArrowsRightLeft } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface TransferRowProps {
  transaction: Transaction;
  walletFrom: WalletAccount | undefined;
  walletTo: WalletAccount | undefined;
  onClick: () => void;
}

export function TransferRow({ transaction, walletFrom, walletTo, onClick }: TransferRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-800">
        <HiOutlineArrowsRightLeft className="h-5 w-5 text-ink-500 dark:text-ink-400" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
          {transaction.title}
        </Words>

        <div className="flex flex-col gap-1.5">
          <TransferLeg wallet={walletFrom} amount={transaction.amount} direction="out" />
          <TransferLeg wallet={walletTo} amount={transaction.amount} direction="in" />
        </div>
      </div>
    </button>
  );
}

interface TransferLegProps {
  wallet: WalletAccount | undefined;
  amount: number;
  direction: "out" | "in";
}

function TransferLeg({ wallet, amount, direction }: TransferLegProps) {
  const { format } = useCurrency();
  const isOut = direction === "out";

  return (
    <div className="flex items-center gap-2">
      {wallet && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 dark:bg-ink-800">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: wallet.color }}
          />
          <Words type="xxs/bold" as="span" className="text-ink-700 dark:text-ink-300">
            {wallet.nameWallet}
          </Words>
        </span>
      )}
      <span className="h-px min-w-4 flex-1 bg-ink-200 dark:bg-ink-700" />
      <Words
        type="sm/bold"
        as="span"
        className={cn(
          "shrink-0 whitespace-nowrap",
          isOut ? "text-red-500 dark:text-red-400" : "text-primary-600 dark:text-primary-400",
        )}
      >
        {isOut ? "▼" : "▲"} {format(amount)}
      </Words>
    </div>
  );
}
