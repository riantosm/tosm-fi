import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LuPlus, LuWallet } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SectionHead } from "@/components/molecules/SectionHead";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/use-wallets";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface WalletQuickSwitcherProps {
  onCorrectBalance: (wallet: WalletAccount) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Dashboard "Saldo · Dompet" card. Tapping the primary wallet opens a balance
 * correction; tapping any other wallet makes it the primary one.
 */
export function WalletQuickSwitcher({ onCorrectBalance }: WalletQuickSwitcherProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { wallets, status, loadWallets, setPrimaryWallet } = useWallets();
  const { format } = useCurrency();
  const { showToast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") void loadWallets();
  }, [status, loadWallets]);

  async function handleSelect(id: string) {
    if (pendingId) return;
    setPendingId(id);
    try {
      await setPrimaryWallet(id);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("wallet.genericError"), "error");
    } finally {
      setPendingId(null);
    }
  }

  const positiveTotal = wallets.reduce((sum, wallet) => sum + Math.max(0, wallet.balance), 0);
  const isInitialLoading = status !== "loaded" && wallets.length === 0;

  return (
    <Card className="flex flex-col gap-3">
      <SectionHead
        eyebrow={t("dashboard.walletsEyebrow")}
        title={t("dashboard.walletsTitle")}
        actionLabel={t("dashboard.manage")}
        onAction={() => navigate(ROUTES.WALLET)}
        className="mb-1"
      />

      {isInitialLoading ? (
        Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[71px] rounded-control" />
        ))
      ) : wallets.length === 0 ? (
        <EmptyState icon={<LuWallet />} title={t("dashboard.noWallets")} />
      ) : (
        wallets.map((wallet, index) => {
          const share = positiveTotal > 0 ? Math.max(0, wallet.balance) / positiveTotal : 0;
          const percent = Math.round(share * 100);
          const isPending = pendingId === wallet.idWallet;
          const hint = wallet.isPrimary
            ? t("dashboard.correctBalanceHint")
            : t("dashboard.setPrimaryHint");

          return (
            <button
              key={wallet.idWallet}
              type="button"
              onClick={() =>
                wallet.isPrimary ? onCorrectBalance(wallet) : void handleSelect(wallet.idWallet)
              }
              disabled={isPending}
              aria-label={`${wallet.nameWallet} · ${hint}`}
              className={cn(
                "pressable group flex w-full flex-col gap-2.5 rounded-control p-3.5 text-left transition-colors duration-200",
                !wallet.isPrimary && "bg-surface-2 hover:bg-surface-3",
              )}
              style={wallet.isPrimary ? { backgroundColor: `${wallet.color}1F` } : undefined}
            >
              <span className="flex w-full min-w-0 items-center gap-2.5">
                {isPending ? (
                  <IconLoader
                    className="size-2.5 shrink-0 animate-spin"
                    style={{ color: wallet.color }}
                  />
                ) : (
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: wallet.color }}
                  />
                )}
                <span className="truncate text-[14px] font-semibold text-text">
                  {wallet.nameWallet}
                </span>
                {wallet.isPrimary && (
                  <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-text">
                    {t("wallet.primary")}
                  </span>
                )}
                {/* Hover hint: collapsed to zero width until hovered so names keep their room. */}
                <span className="hidden max-w-0 shrink-0 overflow-hidden rounded-full bg-surface text-[11px] font-semibold whitespace-nowrap text-text-2 opacity-0 transition-[max-width,opacity,padding] duration-300 group-hover:max-w-[140px] group-hover:px-2 group-hover:py-0.5 group-hover:opacity-100 group-focus-visible:max-w-[140px] group-focus-visible:px-2 group-focus-visible:py-0.5 group-focus-visible:opacity-100 sm:inline">
                  {hint}
                </span>
                <span className="ml-auto shrink-0 pl-2 font-num text-[14px] font-semibold text-text tabular">
                  {format(wallet.balance)}
                </span>
              </span>
              <span className="flex w-full items-center gap-2.5 text-[12px] text-text-3">
                <span className="w-[92px] shrink-0 truncate">
                  {t("wallet.transactionCount", { n: wallet.transactionCount })}
                </span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface">
                  <m.span
                    className="block h-full rounded-full"
                    style={{ backgroundColor: wallet.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(percent, share > 0 ? 3 : 0)}%` }}
                    transition={{ duration: 0.7, ease: EASE, delay: index * 0.05 }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right tabular">{percent}%</span>
              </span>
            </button>
          );
        })
      )}

      <Button
        type="button"
        variant="soft"
        fullWidth
        leftIcon={<LuPlus />}
        onClick={() => navigate(ROUTES.WALLET)}
        className="mt-1"
      >
        {t("dashboard.addWallet")}
      </Button>
    </Card>
  );
}
