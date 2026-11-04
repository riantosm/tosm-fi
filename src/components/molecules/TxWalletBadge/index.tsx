import { WalletTile } from "@/components/atoms/WalletTile";
import type { WalletAccount } from "@/types/wallet.types";

/** The transaction's wallet (logo, or its glyph in the wallet color), pinned to a TxRowBase tile's corner. */
export function TxWalletBadge({ wallet }: { wallet: WalletAccount }) {
  return (
    <WalletTile
      color={wallet.color}
      logoUrl={wallet.logoUrl}
      onTint
      className="size-[18px] rounded-full shadow-card ring-2 ring-surface [&_svg]:size-[11px]"
    />
  );
}
