import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/atoms/Badge";
import { ReorderRow } from "@/components/molecules/ReorderRow";
import { WalletTile } from "@/layouts/wallet/WalletTile";
import { useCurrency } from "@/hooks/use-currency";
import type { WalletAccount } from "@/types/wallet.types";

interface WalletReorderItemProps {
  wallet: WalletAccount;
  isDragging: boolean;
  isActive?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function WalletReorderItem({ wallet, ...rowProps }: WalletReorderItemProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  return (
    <ReorderRow
      {...rowProps}
      leading={<WalletTile color={wallet.color} className="size-10 rounded-[12px]" />}
      title={wallet.nameWallet}
      badge={wallet.isPrimary && <Badge tone="primary">{t("wallet.primary")}</Badge>}
      meta={t("wallet.transactionCount", { n: wallet.transactionCount })}
      trailing={
        <span className="font-num text-[14px] text-text-2 tabular">{format(wallet.balance)}</span>
      }
    />
  );
}
