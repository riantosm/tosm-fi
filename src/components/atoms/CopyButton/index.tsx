import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuCopy } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
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
    <IconButton
      label={t("common.copy")}
      onClick={handleCopy}
      size="sm"
      variant="soft"
      className={cn(isCopied && "text-income-text", className)}
      icon={isCopied ? <LuCheck className="animate-scale-in" /> : <LuCopy />}
    />
  );
}
