import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LuStar } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { WalletAmount } from "@/layouts/wallet/WalletAmount";
import type { WalletAccount } from "@/types/wallet.types";

interface WalletSummaryCardProps {
  wallets: WalletAccount[];
  isLoading?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Hero: total of all wallets, the primary wallet, and each wallet's share as one stacked bar. */
export function WalletSummaryCard({ wallets, isLoading }: WalletSummaryCardProps) {
  const { t } = useTranslation();
  const total = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const positiveTotal = wallets.reduce((sum, wallet) => sum + Math.max(0, wallet.balance), 0);
  const primary = wallets.find((wallet) => wallet.isPrimary);
  const shares = wallets
    .map((wallet) => ({
      wallet,
      share: positiveTotal > 0 ? (Math.max(0, wallet.balance) / positiveTotal) * 100 : 0,
    }))
    .filter((item) => item.share > 0);

  return (
    <section className="flex flex-col gap-3.5 rounded-[24px] bg-gradient-to-br from-hero-bg to-hero-bg-2 p-5 text-hero-fg lg:gap-[18px] lg:rounded-[28px] lg:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1 lg:gap-1.5">
          <span className="truncate text-[13px] text-hero-fg-2 lg:text-[14px]">
            <span className="lg:hidden">{t("wallet.totalShort", { count: wallets.length })}</span>
            <span className="hidden lg:inline">{t("wallet.totalAll")}</span>
          </span>
          {isLoading ? (
            <Skeleton className="h-10 w-56 rounded-full lg:h-12 lg:w-72" />
          ) : (
            <WalletAmount
              value={total}
              className="gap-2 lg:gap-2.5"
              currencyClassName="text-[17px] text-hero-fg-2 lg:text-[20px]"
              numberClassName="text-[34px] tracking-[-0.025em] text-hero-fg sm:text-[40px] lg:text-[48px]"
            />
          )}
        </div>
        {primary && (
          <span className="hidden shrink-0 items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-[13px] font-semibold text-text shadow-card sm:inline-flex">
            <LuStar className="size-3.5 text-investment-text" />
            <span className="max-w-[160px] truncate">
              {t("wallet.primaryChip", { name: primary.nameWallet })}
            </span>
          </span>
        )}
      </div>

      <div className="flex h-2.5 w-full gap-[3px] lg:h-3" aria-hidden="true">
        {shares.length === 0 ? (
          <span className="h-full w-full rounded-full bg-surface/60" />
        ) : (
          shares.map(({ wallet, share }, index) => (
            <m.span
              key={wallet.idWallet}
              className="h-full rounded-[3px] first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: wallet.color, minWidth: 6 }}
              initial={{ width: 0 }}
              animate={{ width: `${share}%` }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 + index * 0.05 }}
            />
          ))
        )}
      </div>

      {shares.length > 0 && (
        <div className="hidden flex-wrap gap-x-[22px] gap-y-1.5 lg:flex">
          {shares.map(({ wallet, share }) => (
            <span
              key={wallet.idWallet}
              className="flex items-center gap-[7px] text-[13px] text-hero-fg-2"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: wallet.color }} />
              {wallet.nameWallet} · {Math.round(share)}%
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
