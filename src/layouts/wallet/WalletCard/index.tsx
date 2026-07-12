import { useTranslation } from "react-i18next";
import { Words } from "@/components/atoms/Words";
import { useCurrency } from "@/hooks/use-currency";
import type { WalletAccount } from "@/types/wallet.types";

interface WalletCardProps {
  wallet: WalletAccount;
  onClick: () => void;
}

export function WalletCard({ wallet, onClick }: WalletCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1.5 rounded-2xl border border-l-4 border-ink-200 bg-white p-5 text-left transition-colors hover:bg-ink-50 dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-ink-800"
      style={{ borderLeftColor: wallet.color }}
    >
      <div className="flex items-center justify-between gap-2">
        <Words type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {wallet.nameWallet}
        </Words>
        {wallet.isPrimary && (
          <span className="flex shrink-0 items-center justify-center rounded-full bg-ink-100 px-2 py-0.5 dark:bg-ink-800">
            <Words type="xs/bold" as="span" className="leading-none text-ink-500 dark:text-ink-400">
              {t("wallet.primary")}
            </Words>
          </span>
        )}
      </div>

      <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
        {t("wallet.transactionCount", { n: wallet.transactionCount })}
      </Words>

      <Words type="xl/bold" className="text-ink-900 dark:text-ink-50">
        {format(wallet.balance)}
      </Words>
    </button>
  );
}
