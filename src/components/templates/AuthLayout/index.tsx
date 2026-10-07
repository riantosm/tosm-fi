import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LuBriefcase, LuCoffee, LuMoon, LuSparkles, LuSun } from "react-icons/lu";
import { Logo } from "@/components/atoms/Logo";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { LanguageMenuButton } from "@/components/molecules/LanguageMenuButton";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/utils/cn";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  /** Big hero headline (defaults to the login one). */
  heroTitle?: string;
  children: ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** The hero preview is laid out at the design's fixed size, then scaled to fit the panel. */
const PREVIEW_WIDTH = 610;
const PREVIEW_HEIGHT = 362;

/** Sample donut slices (pathLength 100), clockwise from the top. */
const PREVIEW_ARCS = [
  { color: "var(--chart-2)", length: 32.3, start: 2.9 },
  { color: "var(--chart-1)", length: 21.3, start: 41 },
  { color: "var(--chart-3)", length: 14.3, start: 68.1 },
  { color: "var(--chart-4)", length: 9.3, start: 88.2 },
];

function PreviewCard({
  className,
  delay,
  children,
}: {
  className: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={cn("absolute rounded-[22px] bg-surface shadow-card-hover", className)}
    >
      {children}
    </m.div>
  );
}

/** Decorative preview cards on the auth hero — static sample values, not user data. */
function HeroPreview() {
  const { t } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / PREVIEW_WIDTH));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rows = [
    {
      icon: LuCoffee,
      color: "#D27C69",
      name: t("auth.heroSampleExpense"),
      meta: t("auth.heroSampleExpenseMeta"),
      amount: "−45.000",
      time: "08.42",
      tone: "text-expense-text",
    },
    {
      icon: LuBriefcase,
      color: "#6FA88A",
      name: t("auth.heroSampleIncome"),
      meta: t("auth.heroSampleIncomeMeta"),
      amount: "+18.500.000",
      time: "09.00",
      tone: "text-income-text",
    },
  ];

  return (
    <div
      ref={frameRef}
      aria-hidden
      className="relative mt-10 w-full"
      style={{ height: PREVIEW_HEIGHT * scale }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, transform: `scale(${scale})` }}
      >
        <PreviewCard delay={0.15} className="top-6 left-0 flex w-[330px] flex-col gap-2.5 p-[22px]">
          <p className="text-[12.5px] text-text-3">{t("auth.heroNetWorth")}</p>
          <p className="font-num text-[28px] leading-tight font-semibold tracking-[-0.02em] text-text tabular">
            IDR 128.450.000
          </p>
          <span className="w-fit rounded-full bg-income-soft px-[9px] py-[3px] text-[11.5px] font-semibold text-income-text">
            {t("auth.heroGrowth", { value: "▲ 4,2%" })}
          </span>
        </PreviewCard>

        <PreviewCard
          delay={0.25}
          className="top-0 left-[360px] flex w-[250px] flex-col items-center gap-3 p-5"
        >
          <p className="text-[12.5px] text-text-3">{t("auth.heroSpending")}</p>
          <svg viewBox="0 0 42 42" className="size-[120px] -rotate-90">
            {PREVIEW_ARCS.map((arc) => (
              <circle
                key={arc.color}
                cx="21"
                cy="21"
                r="18.2"
                fill="none"
                stroke={arc.color}
                strokeWidth="5.6"
                strokeLinecap="round"
                strokeDasharray={`${arc.length} ${100 - arc.length}`}
                strokeDashoffset={-arc.start}
                pathLength={100}
              />
            ))}
          </svg>
        </PreviewCard>

        <PreviewCard
          delay={0.35}
          className="top-[200px] left-[60px] flex w-[440px] flex-col gap-0.5 px-5 py-3.5"
        >
          {rows.map((row) => (
            <div key={row.name} className="flex items-center gap-3.5 py-3">
              <span
                className="flex size-[42px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${row.color}26`, color: row.color }}
              >
                <row.icon className="size-[19px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="truncate text-[14px] font-semibold text-text">{row.name}</span>
                <span className="truncate text-[12.5px] text-text-3">{row.meta}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-[3px]">
                <span className={cn("font-num text-[14px] font-semibold tabular", row.tone)}>
                  {row.amount}
                </span>
                <span className="font-num text-[12px] text-text-3 tabular">{row.time}</span>
              </span>
            </div>
          ))}
        </PreviewCard>
      </div>
    </div>
  );
}

/** Split auth screen (design 02): form left, gradient hero right; phones get a compact hero band. */
export function AuthLayout({ title, subtitle, heroTitle, children }: AuthLayoutProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const headline = heroTitle ?? t("auth.heroTitle");
  const ThemeIcon = theme === "dark" ? LuSun : LuMoon;

  return (
    <div className="grid min-h-svh grid-cols-1 bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-3 lg:p-3">
      <div className="flex min-h-svh flex-col lg:min-h-0 lg:px-10 lg:py-6">
        {/* Phone hero band */}
        <div className="bg-gradient-to-br from-hero-bg to-hero-bg-2 px-5 pt-5 pb-14 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo tone="hero" />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("topbar.theme")}
              className="pressable inline-flex size-9 items-center justify-center rounded-full bg-surface/50 text-hero-fg ring-1 ring-hero-fg/5 ring-inset hover:bg-surface/80"
            >
              <ThemeIcon className="size-4" />
            </button>
          </div>
          <h2 className="mt-6 font-display text-[24px] leading-tight font-semibold text-hero-fg">
            {headline}
          </h2>
        </div>

        <div className="hidden items-center justify-between lg:flex">
          <Logo />
          <ThemeToggle />
        </div>

        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative -mt-8 flex flex-1 flex-col rounded-t-[28px] bg-bg px-5 pt-8 lg:mx-auto lg:mt-0 lg:w-full lg:max-w-[400px] lg:justify-center lg:rounded-none lg:px-0 lg:pt-0"
        >
          <div className="mb-7 flex flex-col gap-1.5">
            <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-text lg:text-[30px]">
              {title}
            </h1>
            <p className="text-[14px] text-text-3">{subtitle}</p>
          </div>
          {children}
        </m.div>

        <div className="flex items-center justify-center gap-4 px-5 py-6 lg:justify-between lg:px-0 lg:py-0">
          <span className="hidden min-w-0 truncate text-[12px] text-text-3 lg:block">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </span>
          <LanguageMenuButton />
        </div>
      </div>

      <div className="relative hidden overflow-hidden rounded-[28px] bg-gradient-to-br from-hero-bg to-hero-bg-2 p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-[560px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1.5 text-[12.5px] font-semibold text-primary-text">
            <LuSparkles className="size-3.5" /> {t("auth.heroBadge")}
          </span>
          <h2 className="mt-5 font-display text-[44px] leading-[1.08] font-semibold tracking-[-0.025em] text-hero-fg">
            {headline}
          </h2>
          <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-hero-fg-2">
            {t("auth.heroSubtitle")}
          </p>
          <HeroPreview />
        </div>
      </div>
    </div>
  );
}
