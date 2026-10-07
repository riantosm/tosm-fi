import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LogoMark } from "@/components/atoms/LogoMark";
import { UserMenu } from "@/components/organisms/UserMenu";
import { NAV_SETTINGS, RAIL_ITEMS, type NavItem } from "@/constants/nav";
import { cn } from "@/utils/cn";

function isPathActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function RailLink({ item, active }: { item: NavItem; active: boolean }) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      aria-label={t(item.labelKey)}
      className="group flex w-[60px] flex-col items-center gap-1 py-1"
    >
      <span className="relative flex h-8 w-12 items-center justify-center rounded-full">
        {active ? (
          <m.span
            layoutId="rail-active-pill"
            className="absolute inset-0 rounded-full bg-nav-active-bg"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        ) : (
          <span className="absolute inset-0 scale-75 rounded-full bg-surface-2 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100" />
        )}
        <Icon
          className={cn(
            "relative size-[19px] transition-colors duration-200",
            active ? "text-nav-active-fg" : "text-text-2 group-hover:text-text",
          )}
        />
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[10.5px] transition-colors duration-200",
          active
            ? "font-semibold text-nav-active-fg"
            : "font-medium text-text-2 group-hover:text-text",
        )}
      >
        {t(item.shortLabelKey)}
      </span>
    </NavLink>
  );
}

/** Slim 76px floating rail (desktop ≥1024px). */
export function Rail() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed top-3 bottom-3 left-3 z-40 hidden w-[76px] flex-col items-center rounded-[24px] bg-surface py-[18px] shadow-card lg:flex">
      <LogoMark size="md" />
      <nav className="mt-[18px] flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto scrollbar-hide">
        {RAIL_ITEMS.map((item) => (
          <RailLink key={item.path} item={item} active={isPathActive(pathname, item.path)} />
        ))}
      </nav>
      <div className="flex flex-col items-center gap-3 pt-2">
        <RailLink item={NAV_SETTINGS} active={isPathActive(pathname, NAV_SETTINGS.path)} />
        <UserMenu />
      </div>
    </aside>
  );
}
