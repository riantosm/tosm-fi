import { LuWallet } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface WalletTileProps {
  color: string;
  /** Size + radius, e.g. "size-10 rounded-[12px]". */
  className?: string;
  /** White (surface) tile instead of the soft wallet-color fill — for tiles on a tinted box. */
  onTint?: boolean;
}

/** Wallet icon tile: the wallet color at 15% behind a wallet glyph in the full color. */
export function WalletTile({ color, className, onTint = false }: WalletTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center [&_svg]:size-[45%]",
        onTint && "bg-surface",
        className,
      )}
      style={onTint ? undefined : { backgroundColor: `${color}26` }}
    >
      <LuWallet style={{ color }} />
    </span>
  );
}
