import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LuWallet } from "react-icons/lu";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SectionHead } from "@/components/molecules/SectionHead";
import { cn } from "@/utils/cn";
import type { WalletUsageItem } from "@/types/report.types";

const EASE = [0.22, 1, 0.36, 1] as const;

interface WalletUsageCardProps {
  items: WalletUsageItem[];
  /** "LAPORAN · DOMPET" */
  eyebrow: string;
  isLoading?: boolean;
  className?: string;
}

/** Wallets ranked by how many of the period's transactions touched them. */
export function WalletUsageCard({
  items,
  eyebrow,
  isLoading = false,
  className,
}: WalletUsageCardProps) {
  const { t } = useTranslation();
  const isInitialLoading = isLoading && items.length === 0;

  return (
    <Card className={cn("flex flex-col gap-4 lg:gap-[18px]", className)}>
      <SectionHead eyebrow={eyebrow} title={t("reports.walletUsage.title")} />

      {isInitialLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[70px] rounded-control" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<LuWallet />} title={t("reports.walletUsage.empty")} className="flex-1" />
      ) : (
        <div
          className={cn(
            "flex flex-col gap-3 transition-opacity duration-300",
            isLoading && "opacity-60",
          )}
        >
          {items.map((item) => (
            <div
              key={item.idWallet}
              className="flex animate-fade-in flex-col gap-2.5 rounded-control bg-surface-2 px-3.5 py-3"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-text">
                  {item.nameWallet}
                </span>
                <span className="shrink-0 font-num text-[14px] font-semibold text-text tabular">
                  {Math.round(item.percentage)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-[92px] shrink-0 text-[12px] text-text-3">
                  {t("reports.walletUsage.transactionCount", { count: item.transactionCount })}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                  <m.span
                    className="block h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, item.percentage)}%` }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
