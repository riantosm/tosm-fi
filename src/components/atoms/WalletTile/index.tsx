import { useState } from "react";
import { LuWallet } from "react-icons/lu";
import { cn } from "@/utils/cn";

interface WalletTileProps {
  color: string;
  /** Uploaded logo; falls back to the wallet glyph when absent or when it fails to load. */
  logoUrl?: string | null;
  /** Size + radius, e.g. "size-10 rounded-[12px]". */
  className?: string;
  /** White (surface) tile instead of the soft wallet-color fill — for tiles on a tinted box. */
  onTint?: boolean;
}

/** Wallet icon tile: the wallet's logo, or the wallet color at 15% behind a wallet glyph in the full color. */
export function WalletTile({ color, logoUrl, className, onTint = false }: WalletTileProps) {
  // Keyed by URL, so a new logo gets a fresh try after an earlier one failed.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showLogo = Boolean(logoUrl) && failedUrl !== logoUrl;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden [&_svg]:size-[45%]",
        (onTint || showLogo) && "bg-surface",
        className,
      )}
      style={onTint || showLogo ? undefined : { backgroundColor: `${color}26` }}
    >
      {showLogo ? (
        <img
          src={logoUrl!}
          alt=""
          draggable={false}
          className="size-full object-contain"
          onError={() => setFailedUrl(logoUrl!)}
        />
      ) : (
        <LuWallet style={{ color }} />
      )}
    </span>
  );
}
