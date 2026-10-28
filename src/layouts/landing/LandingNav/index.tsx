import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { LogoMark } from "@/components/atoms/LogoMark";
import { ROUTES } from "@/constants/routes";

interface LandingNavProps {
  isAuthenticated: boolean;
  onStart: () => void;
}

const LINKS = [
  { href: "#fitur", key: "landing.nav.features" },
  { href: "#catat-cepat", key: "landing.nav.quickEntry" },
  { href: "#harga", key: "landing.nav.pricing" },
  { href: "#faq", key: "landing.nav.faq" },
] as const;

export function LandingNav({ isAuthenticated, onStart }: LandingNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 py-2">
      <a href="#top" className="flex items-center gap-2.5">
        <LogoMark size="sm" />
        <span className="font-display text-[20px] font-semibold tracking-[-0.01em] text-hero-fg">
          TosmFi
        </span>
      </a>

      <div className="hidden items-center gap-8 lg:flex">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[15px] font-medium text-text-2 transition-colors hover:text-text"
          >
            {t(link.key)}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        {isAuthenticated ? (
          <Button size="sm" onClick={onStart}>
            {t("landing.nav.dashboard")}
          </Button>
        ) : (
          <>
            <Link
              to={ROUTES.LOGIN}
              className="hidden h-9 items-center rounded-full px-3.5 text-[14px] font-medium text-text hover:bg-surface/60 sm:inline-flex"
            >
              {t("landing.nav.login")}
            </Link>
            <Button size="sm" onClick={onStart}>
              {t("landing.nav.tryFree")}
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
