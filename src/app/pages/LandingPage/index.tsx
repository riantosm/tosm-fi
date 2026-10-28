import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogoMark } from "@/components/atoms/LogoMark";
import { LanguageMenuButton } from "@/components/molecules/LanguageMenuButton";
import { ROUTES, UPGRADE_QUERY } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { LandingCatatCepat } from "@/layouts/landing/LandingCatatCepat";
import { LandingFaq } from "@/layouts/landing/LandingFaq";
import { LandingFeatures } from "@/layouts/landing/LandingFeatures";
import { LandingFinalCta } from "@/layouts/landing/LandingFinalCta";
import { LandingHero } from "@/layouts/landing/LandingHero";
import { LandingNav } from "@/layouts/landing/LandingNav";
import { LandingPricing } from "@/layouts/landing/LandingPricing";

const SECTION = "px-4 py-20 sm:px-8 lg:px-20 lg:py-28";
const HERO_GRADIENT = "bg-gradient-to-br from-hero-bg to-hero-bg-2";

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Every CTA goes through login first; "buy" then opens the Upgrade dialog on the dashboard.
  const handleStart = () => navigate(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN);
  const handleBuyPro = () =>
    navigate(
      isAuthenticated
        ? `${ROUTES.DASHBOARD}?${UPGRADE_QUERY}=1`
        : `${ROUTES.LOGIN}?next=${UPGRADE_QUERY}`,
    );

  return (
    <div id="top" className="min-h-dvh overflow-x-clip bg-bg text-text">
      <header className={`${HERO_GRADIENT} px-4 pt-4 pb-20 sm:px-8 lg:px-20 lg:pt-6 lg:pb-24`}>
        <LandingNav isAuthenticated={isAuthenticated} onStart={handleStart} />
        <LandingHero onStart={handleStart} />
      </header>

      <section id="fitur" className={SECTION}>
        <LandingFeatures />
      </section>

      <section
        id="catat-cepat"
        className={`dark bg-[radial-gradient(120%_140%_at_85%_30%,var(--hero-bg),var(--bg))] ${SECTION}`}
      >
        <LandingCatatCepat />
      </section>

      <section id="harga" className={SECTION}>
        <LandingPricing onStart={handleStart} onBuyPro={handleBuyPro} />
      </section>

      <section id="faq" className={`bg-surface ${SECTION}`}>
        <LandingFaq />
      </section>

      <section className={`${HERO_GRADIENT} ${SECTION}`}>
        <LandingFinalCta onStart={handleStart} />
      </section>

      <footer className="flex flex-col items-center justify-between gap-4 border-t border-border bg-surface px-4 py-8 sm:flex-row sm:px-8 lg:px-20">
        <span className="flex items-center gap-2.5 text-[14px] text-text-3">
          <LogoMark size="xs" />
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </span>
        <LanguageMenuButton />
      </footer>
    </div>
  );
}
