import { WalletTile } from "@/components/atoms/WalletTile";
import type { WalletAccount } from "@/types/wallet.types";

/** Wallet logo/glyph sized for a Chip's `icon` slot (pair the chip with `pl-1.5`). */
export function WalletChipIcon({ wallet }: { wallet: Pick<WalletAccount, "color" | "logoUrl"> }) {
  return (
    <WalletTile
      color={wallet.color}
      logoUrl={wallet.logoUrl}
      className="size-5 rounded-full [&_svg]:!size-3"
    />
  );
}
