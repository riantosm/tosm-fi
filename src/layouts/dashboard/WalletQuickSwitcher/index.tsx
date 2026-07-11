import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlineWallet } from "react-icons/hi2";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import { useWallets } from "@/hooks/use-wallets";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export function WalletQuickSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { wallets, status, loadWallets, setPrimaryWallet } = useWallets();
  const { format } = useCurrency();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") void loadWallets();
  }, [status, loadWallets]);

  async function handleSelect(id: string) {
    if (pendingId) return;
    setPendingId(id);
    try {
      await setPrimaryWallet(id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-100">
        {t("nav.wallet")}
      </Words>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            type="button"
            onClick={() => {
              if (!wallet.isPrimary) void handleSelect(wallet.id);
            }}
            disabled={pendingId === wallet.id}
            className={cn(
              "relative flex w-44 shrink-0 flex-col gap-1 rounded-2xl border-2 bg-white p-4 text-left transition-colors dark:bg-ink-900",
              wallet.isPrimary
                ? ""
                : "border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800",
            )}
            style={wallet.isPrimary ? { borderColor: wallet.color } : undefined}
          >
            <span
              className={cn(
                "absolute right-2.5 top-2.5 flex shrink-0 items-center justify-center rounded-full transition-all",
                pendingId === wallet.id ? "h-6 w-6 bg-ink-100 dark:bg-ink-800" : "h-3 w-3",
              )}
            >
              {pendingId === wallet.id ? (
                <IconLoader className="h-4 w-4 animate-spin" style={{ color: wallet.color }} />
              ) : (
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: wallet.color }}
                />
              )}
            </span>
            <Words type="base/bold" className="truncate pr-4 text-ink-900 dark:text-ink-50">
              {wallet.name}
            </Words>
            <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
              {format(wallet.balance)}
            </Words>
            <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
              {t("wallet.transactionCount", { n: wallet.transactionCount })}
            </Words>
          </button>
        ))}

        <button
          type="button"
          onClick={() => navigate(ROUTES.WALLET)}
          className="flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400"
        >
          <HiOutlineWallet className="h-5 w-5" />
          <Words type="xs/bold" as="span">
            {t("nav.wallet")}
          </Words>
        </button>
      </div>
    </div>
  );
}
