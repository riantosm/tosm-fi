import { useTranslation } from "react-i18next";
import { LuHourglass, LuPlus, LuRotateCw, LuWifiOff } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import type { AssistantErrorKind } from "@/types/assistant.types";
import { cn } from "@/utils/cn";

interface AssistantErrorBannerProps {
  error: AssistantErrorKind;
  onRetry: () => void;
  onManualEntry: () => void;
  isBusy?: boolean;
}

/** Quota-full (amber) / connection-failed (red) banner with recovery actions. */
export function AssistantErrorBanner({
  error,
  onRetry,
  onManualEntry,
  isBusy,
}: AssistantErrorBannerProps) {
  const { t } = useTranslation();
  const isQuota = error === "quota";

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div
        className={cn(
          "flex items-start gap-3 rounded-[14px] px-3.5 py-3",
          isQuota ? "bg-investment-soft" : "bg-expense-soft",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-surface [&_svg]:size-4",
            isQuota ? "text-investment-text" : "text-expense-text",
          )}
        >
          {isQuota ? <LuHourglass /> : <LuWifiOff />}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className={cn(
              "text-[13.5px] font-semibold",
              isQuota ? "text-investment-text" : "text-expense-text",
            )}
          >
            {isQuota ? t("assistant.quotaTitle") : t("assistant.networkTitle")}
          </span>
          <span className="text-[13px] leading-[1.45] text-text-2">
            {isQuota ? t("assistant.quotaBody") : t("assistant.networkBody")}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          leftIcon={<LuRotateCw />}
          onClick={onRetry}
          disabled={isBusy}
        >
          {t("assistant.retry")}
        </Button>
        {isQuota && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<LuPlus />}
            onClick={onManualEntry}
          >
            {t("assistant.manualEntry")}
          </Button>
        )}
      </div>
    </div>
  );
}
