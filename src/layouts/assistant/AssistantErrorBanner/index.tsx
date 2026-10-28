import { useTranslation } from "react-i18next";
import { LuHourglass, LuLock, LuPlus, LuRotateCw, LuSparkles, LuWifiOff } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { usePlan } from "@/hooks/use-plan";
import { useUpgrade } from "@/hooks/use-upgrade";
import type { AssistantErrorKind } from "@/types/assistant.types";
import { cn } from "@/utils/cn";

interface AssistantErrorBannerProps {
  error: AssistantErrorKind;
  onRetry: () => void;
  onManualEntry: () => void;
  isBusy?: boolean;
}

/** Quota-full or plan-limit (amber) / connection-failed (red) banner with recovery actions. */
export function AssistantErrorBanner({
  error,
  onRetry,
  onManualEntry,
  isBusy,
}: AssistantErrorBannerProps) {
  const { t } = useTranslation();
  const { isPro, limits } = usePlan();
  const { openUpgrade } = useUpgrade();
  const isPlan = error === "plan";
  // Both "AI busy" and "messages used up" are amber and offer manual entry.
  const isQuota = error === "quota" || isPlan;

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
          {isPlan ? <LuLock /> : isQuota ? <LuHourglass /> : <LuWifiOff />}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className={cn(
              "text-[13.5px] font-semibold",
              isQuota ? "text-investment-text" : "text-expense-text",
            )}
          >
            {isPlan
              ? t("assistant.planLimitTitle")
              : isQuota
                ? t("assistant.quotaTitle")
                : t("assistant.networkTitle")}
          </span>
          <span className="text-[13px] leading-[1.45] text-text-2">
            {isPlan
              ? t(isPro ? "assistant.planLimitBodyPro" : "assistant.planLimitBody", {
                  count: limits.aiMessagesPerMonth ?? 0,
                })
              : isQuota
                ? t("assistant.quotaBody")
                : t("assistant.networkBody")}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {isPlan ? (
          !isPro && (
            <Button
              type="button"
              size="sm"
              leftIcon={<LuSparkles />}
              onClick={() => openUpgrade("aiMessages")}
            >
              {t("plan.upgradeCta")}
            </Button>
          )
        ) : (
          <Button
            type="button"
            size="sm"
            leftIcon={<LuRotateCw />}
            onClick={onRetry}
            disabled={isBusy}
          >
            {t("assistant.retry")}
          </Button>
        )}
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
