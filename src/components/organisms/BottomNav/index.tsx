import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LuMenu, LuSparkles } from "react-icons/lu";
import {
  MORE_MENU_ITEMS,
  NAV_DASHBOARD,
  NAV_INVESTMENT,
  NAV_TRANSACTIONS,
  type NavItem,
} from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { cn } from "@/utils/cn";

function Slot({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className="relative flex size-11 items-center justify-center rounded-full">
      {active && (
        <m.span
          layoutId="bottom-nav-active"
          className="absolute inset-0 rounded-full bg-primary-soft"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span
        className={cn("relative [&_svg]:size-[21px]", active ? "text-primary-text" : "text-text-3")}
      >
        {children}
      </span>
    </span>
  );
}

function NavSlot({ item, active }: { item: NavItem; active: boolean }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      aria-label={t(item.labelKey)}
      className="pressable flex flex-1 items-center justify-center"
    >
      <Slot active={active}>
        <Icon />
      </Slot>
    </NavLink>
  );
}

/**
 * Phone bottom tab — 5 equal icon-only slots: Beranda, Transaksi, AI (Catat
 * Cepat), Investasi, Lainnya. Pages without their own slot mark Lainnya active.
 */
export function BottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { openAssistant, setMoreOpen, isMoreOpen } = useQuickAdd();
  const is = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const isMoreActive =
    isMoreOpen || is(ROUTES.PROFILE) || MORE_MENU_ITEMS.some((item) => is(item.path));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-[max(env(safe-area-inset-bottom),20px)] lg:hidden"
      aria-label={t("nav.menu")}
    >
      <div className="flex h-16 w-full max-w-[420px] items-center rounded-full bg-surface px-1.5 shadow-[0_10px_30px_var(--shadow-pop-color)]">
        <NavSlot item={NAV_DASHBOARD} active={!isMoreOpen && is(ROUTES.DASHBOARD)} />
        <NavSlot item={NAV_TRANSACTIONS} active={!isMoreOpen && is(ROUTES.TRANSACTIONS)} />
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={openAssistant}
            aria-label={t("nav.quickAdd")}
            className="pressable flex size-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow-[0_8px_20px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
          >
            <LuSparkles className="size-[22px]" />
          </button>
        </div>
        <NavSlot item={NAV_INVESTMENT} active={!isMoreOpen && is(ROUTES.INVESTMENT)} />
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label={t("nav.more")}
          className="pressable flex flex-1 items-center justify-center"
        >
          <Slot active={isMoreActive}>
            <LuMenu />
          </Slot>
        </button>
      </div>
    </nav>
  );
}
