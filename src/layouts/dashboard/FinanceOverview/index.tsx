import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  LuChevronRight,
  LuEye,
  LuEyeOff,
  LuMoon,
  LuSearch,
  LuSun,
  LuTrendingUp,
  LuWallet,
} from "react-icons/lu";
import { Avatar } from "@/components/atoms/Avatar";
import { Logo } from "@/components/atoms/Logo";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Tooltip } from "@/components/atoms/Tooltip";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { useTheme } from "@/hooks/use-theme";
import { getGreetingKey } from "@/utils/greeting";
import { AssetAllocationCard } from "@/layouts/dashboard/AssetAllocationCard";
import { AMOUNT_MASK, useMoneyFormat } from "@/hooks/use-money-format";
import { toIntlLocale } from "@/utils/locale";
import { HeroIconButton, HeroLanguageMenu } from "./HeroControls";
import type { DashboardSummary } from "@/types/report.types";

interface FinanceOverviewProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

function BalanceChip({
  icon,
  label,
  value,
  isLoading,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lift group flex w-full min-w-0 items-center gap-3 rounded-full bg-surface py-2.5 pr-3.5 pl-2.5 text-left shadow-card sm:w-auto sm:pr-4"
    >
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-surface-2 [&_svg]:size-4">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[11.5px] text-text-3 lg:text-[12px]">{label}</span>
        {isLoading ? (
          <Skeleton className="mt-1 h-4 w-28 rounded-full" />
        ) : (
          <span className="truncate font-num text-[15px] font-semibold text-text tabular">
            {value}
          </span>
        )}
      </span>
      <LuChevronRight className="size-4 shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}

/** Dashboard hero band: greeting + app bar, net worth, balance chips and the allocation card. */
export function FinanceOverview({ summary, isLoading }: FinanceOverviewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { setMoreOpen } = useQuickAdd();
  const { symbol, format, formatNumber } = useMoneyFormat();
  const [isVisible, setIsVisible] = useState(true);

  const walletTotalBalance = summary?.wallet.totalBalance ?? 0;
  const walletCount = summary?.wallet.walletCount ?? 0;
  const investmentTotalValue = summary?.investment.totalCurrentValue ?? 0;
  const instrumentCount = summary?.investment.instrumentCount ?? 0;
  const netWorth = walletTotalBalance + investmentTotalValue;
  const isInitialLoading = isLoading && !summary;

  const firstName =
    user?.nameUser?.trim().split(/\s+/)[0] || user?.username || t("dashboard.greetingFallbackName");
  const greeting = t(getGreetingKey(), { name: firstName });
  const todayLabel = new Intl.DateTimeFormat(toIntlLocale(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const visibilityLabel = t(isVisible ? "dashboard.hideAmount" : "dashboard.showAmount");
  const themeLabel = t("topbar.theme");
  const ThemeIcon = theme === "dark" ? LuSun : LuMoon;

  function openSearch() {
    navigate(ROUTES.TRANSACTIONS, { state: { focusSearch: true } });
  }

  return (
    <section className="-mx-4 flex flex-col gap-[18px] rounded-b-[32px] pt-[env(safe-area-inset-top)] bg-gradient-to-br from-hero-bg to-hero-bg-2 px-5 pb-7 text-hero-fg sm:-mx-6 sm:px-6 lg:mx-0 lg:gap-[26px] lg:rounded-[28px] lg:px-8 lg:pt-[22px] lg:pb-8">
      {/* Phone / tablet app bar */}
      <div className="flex h-16 items-center justify-between gap-3 lg:hidden">
        <Logo tone="hero" />
        <div className="flex items-center gap-2">
          <HeroIconButton
            size="sm"
            tooltip={false}
            label={t("topbar.searchTransactions")}
            icon={<LuSearch />}
            onClick={openSearch}
          />
          <HeroIconButton
            size="sm"
            tooltip={false}
            label={themeLabel}
            icon={<ThemeIcon />}
            onClick={toggleTheme}
          />
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label={user?.nameUser ?? t("nav.more")}
            className="pressable rounded-full"
          >
            <Avatar name={user?.nameUser} size="sm" className="size-9 bg-primary text-primary-fg" />
          </button>
        </div>
      </div>

      {/* Desktop top row */}
      <div className="hidden items-center justify-between gap-6 lg:flex">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[13px] font-medium text-hero-fg-2 first-letter:uppercase">
            {todayLabel}
          </span>
          <h1 className="truncate font-display text-[22px] font-semibold text-hero-fg">
            {greeting}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            className="pressable flex h-9 w-[280px] items-center gap-2.5 rounded-full bg-surface/50 px-4 text-left text-[13.5px] text-hero-fg-2 ring-1 ring-hero-fg/5 ring-inset hover:bg-surface/80 xl:w-[300px]"
          >
            <LuSearch className="size-4 shrink-0" />
            <span className="truncate">{t("topbar.searchTransactions")}</span>
          </button>
          <HeroIconButton label={themeLabel} icon={<ThemeIcon />} onClick={toggleTheme} />
          <HeroLanguageMenu />
        </div>
      </div>

      <h1 className="truncate font-display text-[17px] font-medium text-hero-fg-2 lg:hidden">
        {greeting}
      </h1>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-[18px] lg:gap-3.5">
          <div className="flex flex-col gap-1 lg:gap-1.5">
            <div className="flex items-center gap-1.5 lg:gap-2">
              <span className="text-[13px] text-hero-fg-2 lg:text-[14px]">
                {t("dashboard.totalNetWorth")}
              </span>
              <Tooltip content={visibilityLabel}>
                <button
                  type="button"
                  onClick={() => setIsVisible((prev) => !prev)}
                  aria-label={visibilityLabel}
                  aria-pressed={!isVisible}
                  className="pressable flex size-7 items-center justify-center rounded-full text-hero-fg-2 hover:bg-surface/50 hover:text-hero-fg"
                >
                  {isVisible ? <LuEye className="size-4" /> : <LuEyeOff className="size-4" />}
                </button>
              </Tooltip>
            </div>

            {isInitialLoading ? (
              <Skeleton className="h-[42px] w-64 rounded-full lg:h-[60px] lg:w-96" />
            ) : (
              <div
                key={isVisible ? "shown" : "hidden"}
                className="flex min-w-0 animate-fade-in items-end gap-2 lg:gap-2.5"
              >
                <span className="shrink-0 pb-0.5 font-display text-[18px] font-medium text-hero-fg-2 lg:pb-1 lg:text-[24px]">
                  {symbol}
                </span>
                <span className="truncate font-num text-[42px] leading-none font-semibold tracking-[-0.025em] text-hero-fg tabular sm:text-[48px] lg:text-[60px]">
                  {isVisible ? formatNumber(netWorth) : AMOUNT_MASK}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:pt-1.5">
            <BalanceChip
              icon={<LuWallet className="text-cash-text" />}
              label={t("dashboard.yourMoneyMeta", { count: walletCount })}
              value={isVisible ? format(walletTotalBalance) : AMOUNT_MASK}
              isLoading={isInitialLoading}
              onClick={() => navigate(ROUTES.WALLET)}
            />
            <BalanceChip
              icon={<LuTrendingUp className="text-investment-text" />}
              label={t("dashboard.yourInvestmentMeta", { count: instrumentCount })}
              value={isVisible ? format(investmentTotalValue) : AMOUNT_MASK}
              isLoading={isInitialLoading}
              onClick={() => navigate(ROUTES.INVESTMENT)}
            />
          </div>
        </div>

        <div className="hidden sm:block lg:w-[440px] lg:shrink-0">
          <AssetAllocationCard
            summary={summary}
            isLoading={isLoading}
            isAmountVisible={isVisible}
          />
        </div>
      </div>
    </section>
  );
}
