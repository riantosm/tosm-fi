import { useTranslation } from "react-i18next";
import { LuArrowRight } from "react-icons/lu";
import { AiMark } from "@/components/atoms/AiMark";
import { Button } from "@/components/atoms/Button";
import { PRO_LIFETIME_PRICE } from "@/constants/plans";
import { usePlan } from "@/hooks/use-plan";
import { useUpgrade } from "@/hooks/use-upgrade";
import { cn } from "@/utils/cn";
import { formatRupiah } from "@/utils/format-rupiah";

/** "Upgrade ke Pro" strip for Free accounts; renders nothing on Pro. */
export function UpgradeBanner({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { isPro, info } = usePlan();
  const { openUpgrade } = useUpgrade();

  if (isPro) return null;

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-card bg-primary-soft p-5 sm:flex-row sm:items-center lg:px-6",
        className,
      )}
    >
      <AiMark size="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="font-display text-[18px] font-semibold text-hero-fg">
          {t("plan.bannerTitle")}
        </h2>
        <p className="text-[13.5px] leading-[1.5] text-text-2">
          {t("plan.bannerBody", {
            price: formatRupiah(info?.proLifetimePrice ?? PRO_LIFETIME_PRICE),
          })}
        </p>
      </div>
      <Button rightIcon={<LuArrowRight />} onClick={() => openUpgrade()} className="sm:self-center">
        {t("plan.upgradeCta")}
      </Button>
    </section>
  );
}
