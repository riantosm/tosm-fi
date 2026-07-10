import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconCheck, IconCopy } from "@/components/atoms/Icons";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utils/cn";

interface CopyButtonProps {
  value: string;
  className?: string;
}

const COPIED_RESET_MS = 1500;

export function CopyButton({ value, className }: CopyButtonProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      showToast(t("common.copySuccess"), "success");
      setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
    } catch {
      showToast(t("common.copyError"), "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t("common.copy")}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors",
        "hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800 dark:hover:text-ink-300",
        className,
      )}
    >
      {isCopied ? (
        <IconCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      ) : (
        <IconCopy className="h-4 w-4" />
      )}
    </button>
  );
}
