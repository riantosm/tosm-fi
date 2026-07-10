import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineBars3 } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface WalletReorderItemProps {
  wallet: WalletAccount;
  isDragging: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

export function WalletReorderItem({
  wallet,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: WalletReorderItemProps) {
  const { t } = useTranslation();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "flex cursor-grab items-center gap-3 rounded-2xl border-2 border-l-4 bg-white p-4 transition-opacity active:cursor-grabbing dark:bg-ink-900",
        isDragging ? "opacity-40" : "border-ink-200 dark:border-ink-800",
      )}
      style={{ borderLeftColor: wallet.color }}
    >
      <HiOutlineBars3 className="h-5 w-5 shrink-0 text-ink-300 dark:text-ink-600" />
      <Words type="sm/bold" className="flex-1 truncate text-ink-900 dark:text-ink-50">
        {wallet.name}
      </Words>
      {wallet.isPrimary && (
        <span className="flex shrink-0 items-center justify-center rounded-full bg-ink-100 px-2 py-0.5 dark:bg-ink-800">
          <Words type="xs/bold" as="span" className="leading-none text-ink-500 dark:text-ink-400">
            {t("wallet.primary")}
          </Words>
        </span>
      )}
    </div>
  );
}
