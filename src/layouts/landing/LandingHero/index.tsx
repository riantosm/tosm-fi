import { useTranslation } from "react-i18next";
import { LuArrowRight, LuCheck } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { AiMark } from "@/components/atoms/AiMark";
import { Reveal } from "@/components/atoms/Reveal";
import dashboardShot from "@/assets/images/landing/dashboard.jpg";
import dashboardMobileShot from "@/assets/images/landing/dashboard-mobile.jpg";

interface LandingHeroProps {
  onStart: () => void;
}

const REASSURANCE = [
  "landing.hero.reassureFree",
  "landing.hero.reassureNoCard",
  "landing.hero.reassurePlatforms",
] as const;

export function LandingHero({ onStart }: LandingHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 pt-12 lg:grid-cols-[520px_1fr] lg:gap-14 lg:pt-[72px]">
      <Reveal immediate className="flex flex-col gap-7">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-surface bg-surface/70 py-1.5 pr-3.5 pl-1.5">
          <AiMark size="xs" />
          <span className="text-[13px] font-medium text-primary-text">
            {t("landing.hero.eyebrow")}
          </span>
        </span>
        <h1 className="font-display text-[42px] leading-[1.04] font-semibold tracking-[-0.03em] text-hero-fg sm:text-[56px] lg:text-[64px]">
          {t("landing.hero.title")}
        </h1>
        <p className="max-w-[520px] text-[17px] leading-[1.55] text-text-2 sm:text-[18px]">
          {t("landing.hero.subtitle")}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button size="lg" rightIcon={<LuArrowRight />} onClick={onStart}>
            {t("landing.hero.ctaPrimary")}
          </Button>
          <a
            href="#harga"
            className="pressable inline-flex h-[50px] items-center rounded-full border border-border bg-surface/80 px-6 text-[14.5px] font-semibold text-text hover:bg-surface"
          >
            {t("landing.hero.ctaSecondary")}
          </a>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {REASSURANCE.map((key) => (
            <li key={key} className="flex items-center gap-1.5 text-[14px] text-text-2">
              <LuCheck className="size-4 text-income-text" />
              {t(key)}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal immediate delay={0.1} className="relative h-[340px] sm:h-[480px] lg:h-[560px]">
        <img
          src={dashboardShot}
          alt={t("landing.hero.shotAlt")}
          className="absolute top-0 left-[12%] w-[150%] max-w-none rounded-[22px] border-[6px] border-surface shadow-pop sm:w-[760px] lg:left-[70px] lg:w-[820px]"
        />
        <img
          src={dashboardMobileShot}
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[120px] rounded-[26px] border-[5px] border-surface shadow-pop sm:w-[180px]"
        />
      </Reveal>
    </div>
  );
}
