import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import {
  LuCalendarClock,
  LuChartColumn,
  LuLayoutDashboard,
  LuTarget,
  LuTrendingUp,
  LuWallet,
} from "react-icons/lu";
import { Reveal } from "@/components/atoms/Reveal";
import { LandingSectionHead } from "@/layouts/landing/LandingSectionHead";

const FEATURES: { key: string; icon: IconType; tone: string }[] = [
  { key: "netWorth", icon: LuLayoutDashboard, tone: "bg-primary-soft text-primary-text" },
  { key: "budget", icon: LuTarget, tone: "bg-expense-soft text-expense-text" },
  { key: "schedule", icon: LuCalendarClock, tone: "bg-investment-soft text-investment-text" },
  { key: "investment", icon: LuTrendingUp, tone: "bg-income-soft text-income-text" },
  { key: "reports", icon: LuChartColumn, tone: "bg-primary-soft text-primary-text" },
  { key: "wallets", icon: LuWallet, tone: "bg-expense-soft text-expense-text" },
];

export function LandingFeatures() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-16">
      <LandingSectionHead
        eyebrow={t("landing.features.eyebrow")}
        title={t("landing.features.title")}
        subtitle={t("landing.features.subtitle")}
      />
      <div className="grid w-full gap-x-14 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ key, icon: Icon, tone }, index) => (
          <Reveal key={key} delay={index * 0.05} className="flex flex-col gap-4">
            <span className={`flex size-12 items-center justify-center rounded-[14px] ${tone}`}>
              <Icon className="size-[22px]" />
            </span>
            <h3 className="font-display text-[21px] font-semibold text-hero-fg">
              {t(`landing.features.${key}.title`)}
            </h3>
            <p className="text-[15px] leading-[1.6] text-text-2">
              {t(`landing.features.${key}.body`)}
            </p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
