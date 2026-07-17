import { useTranslation } from "react-i18next";
import { HiXMark } from "react-icons/hi2";
import { Tooltip } from "@/components/atoms/Tooltip";
import { cn } from "@/utils/cn";

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
}

export function ModalCloseButton({ onClose, className }: ModalCloseButtonProps) {
  const { t } = useTranslation();

  return (
    <Tooltip content={t("common.close")}>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800 dark:hover:text-ink-300",
          className,
        )}
      >
        <HiXMark className="h-5 w-5" />
      </button>
    </Tooltip>
  );
}
