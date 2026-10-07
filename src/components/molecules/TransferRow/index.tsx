import { LuArrowLeftRight } from "react-icons/lu";
import { TxRowBase } from "@/components/molecules/TxRowBase";
import { formatTxTime } from "@/utils/tx-time";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import type { Transaction } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";

interface TransferRowProps {
  transaction: Transaction;
  walletFrom: WalletAccount | undefined;
  walletTo: WalletAccount | undefined;
  onClick: () => void;
}

export function TransferRow({ transaction, walletFrom, walletTo, onClick }: TransferRowProps) {
  const { format } = useCurrency();
  const { language } = useLanguage();

  return (
    <TxRowBase
      onClick={onClick}
      icon={<LuArrowLeftRight />}
      color="#8A94A0"
      title={
        transaction.title || `${walletFrom?.nameWallet ?? "?"} → ${walletTo?.nameWallet ?? "?"}`
      }
      meta={`${walletFrom?.nameWallet ?? "?"} → ${walletTo?.nameWallet ?? "?"}`}
      amount={format(transaction.amount)}
      amountTone="muted"
      caption={formatTxTime(transaction.date, language)}
    />
  );
}
