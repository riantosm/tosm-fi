import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Words } from "@/components/atoms/Words";
import type { WalletUsageItem } from "@/types/report.types";

interface WalletUsageRowProps {
  item: WalletUsageItem;
}

function WalletUsageRow({ item }: WalletUsageRowProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(item.percentage));
    return () => cancelAnimationFrame(frame);
  }, [item.percentage]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Words type="sm/bold" as="span" className="truncate text-ink-700 dark:text-ink-300">
          {item.nameWallet}
        </Words>
        <Words type="sm/bold" as="span" className="shrink-0 text-ink-900 dark:text-ink-50">
          {Math.round(item.percentage)}%
        </Words>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}

interface WalletUsageCardProps {
  items: WalletUsageItem[];
}

export function WalletUsageCard({ items }: WalletUsageCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
        {t("reports.walletUsage.title")}
      </Words>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink-200 py-10 dark:border-ink-800">
          <Words type="sm/bold" className="text-ink-500 dark:text-ink-400">
            {t("reports.walletUsage.empty")}
          </Words>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <WalletUsageRow key={item.idWallet} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
