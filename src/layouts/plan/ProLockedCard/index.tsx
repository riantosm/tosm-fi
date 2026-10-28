import { useTranslation } from "react-i18next";
import { LuLock } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/molecules/Card";
import { cn } from "@/utils/cn";

interface ProLockedCardProps {
  eyebrow: string;
  title: string;
  description: string;
  onUpgrade: () => void;
  className?: string;
}

/** Stands in for a Pro-only card on the Free plan. */
export function ProLockedCard({
  eyebrow,
  title,
  description,
  onUpgrade,
  className,
}: ProLockedCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={cn("flex flex-col gap-5", className)}>
      <span className="text-[11px] font-semibold tracking-[0.08em] text-text-3 uppercase">
        {eyebrow}
      </span>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-text">
          <LuLock className="size-5" />
        </span>
        <h3 className="font-display text-[17px] font-semibold text-text">{title}</h3>
        <p className="max-w-[360px] text-[13.5px] leading-[1.5] text-text-2">{description}</p>
        <Button size="sm" onClick={onUpgrade} className="mt-1">
          {t("plan.upgradeCta")}
        </Button>
      </div>
    </Card>
  );
}
