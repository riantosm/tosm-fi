import { Chip } from "@/components/molecules/Chip";
import type { WalletAccount } from "@/types/wallet.types";

interface WalletChipGroupProps {
  label?: string;
  wallets: WalletAccount[];
  selectedId: string | null;
  /** Wallet that can't be picked (the other side of a transfer). */
  disabledId?: string | null;
  onSelect: (id: string) => void;
  size?: "sm" | "md";
}

/** Labelled single-select row of wallet chips (color dot + name). */
export function WalletChipGroup({
  label,
  wallets,
  selectedId,
  disabledId,
  onSelect,
  size = "sm",
}: WalletChipGroupProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      {label && <span className="text-[13px] font-semibold text-text-2">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {wallets.map((wallet) => (
          <Chip
            key={wallet.idWallet}
            size={size}
            variant="outline"
            dot={wallet.color}
            active={selectedId === wallet.idWallet}
            disabled={wallet.idWallet === disabledId}
            onClick={() => onSelect(wallet.idWallet)}
            className="max-w-[180px]"
          >
            {wallet.nameWallet}
          </Chip>
        ))}
      </div>
    </div>
  );
}
