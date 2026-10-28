import { useTranslation } from "react-i18next";
import { LuArrowRight } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { LogoMark } from "@/components/atoms/LogoMark";
import { Reveal } from "@/components/atoms/Reveal";

export function LandingFinalCta({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();

  return (
    <Reveal className="mx-auto flex max-w-[760px] flex-col items-center gap-7 text-center">
      <LogoMark size="lg" className="size-16" />
      <h2 className="font-display text-[36px] leading-[1.06] font-semibold tracking-[-0.025em] text-hero-fg sm:text-[52px]">
        {t("landing.finalCta.title")}
      </h2>
      <p className="text-[17px] text-text-2 sm:text-[18px]">{t("landing.finalCta.subtitle")}</p>
      <Button size="lg" rightIcon={<LuArrowRight />} onClick={onStart}>
        {t("landing.finalCta.cta")}
      </Button>
    </Reveal>
  );
}
