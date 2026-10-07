import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { LuChevronRight, LuLanguages, LuLogOut, LuSunMoon, LuUserPen } from "react-icons/lu";
import { Avatar } from "@/components/atoms/Avatar";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { LanguageSwitcher } from "@/components/organisms/LanguageSwitcher";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { cn } from "@/utils/cn";

/** Hook shared by the desktop user menu and the phone "Lainnya" sheet. */
// eslint-disable-next-line react-refresh/only-export-components
export function useLogoutFlow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { confirm } = useConfirmDialog();

  return async function handleLogout() {
    const confirmed = await confirm({
      title: t("auth.logoutConfirmTitle"),
      description: t("auth.logoutConfirmDescription"),
      confirmLabel: t("auth.logoutConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (confirmed) {
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };
}

export function MenuRow({
  icon,
  label,
  onClick,
  trailing,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  trailing?: ReactNode;
  danger?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left",
        onClick && "pressable hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-4",
          danger ? "bg-expense-soft text-expense-text" : "bg-surface-2 text-text-2",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13.5px] font-medium",
          danger ? "text-expense-text" : "text-text",
        )}
      >
        {label}
      </span>
      {trailing}
    </Comp>
  );
}

interface UserMenuProps {
  className?: string;
}

/** Rail avatar → popover with profile, theme, language and logout (design 11 · Menu pengguna). */
export function UserMenu({ className }: UserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleLogout = useLogoutFlow();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={user?.nameUser}
        className="pressable rounded-full"
      >
        <Avatar name={user?.nameUser} ring={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, x: -8, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "bottom left" }}
            className="absolute bottom-0 left-full z-50 ml-4 flex w-80 flex-col gap-1 rounded-[24px] bg-surface p-3 shadow-pop"
          >
            <div className="mb-1 flex items-center gap-3 rounded-[18px] bg-surface-2 p-3">
              <Avatar name={user?.nameUser} size="md" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[14px] font-semibold text-text">
                  {user?.nameUser}
                </span>
                <span className="truncate text-[12px] text-text-3">
                  @{user?.username}
                  {user?.role === "admin" ? " · Admin" : ""}
                </span>
              </div>
            </div>
            <MenuRow
              icon={<LuUserPen />}
              label={t("topbar.editProfile")}
              onClick={() => {
                setIsOpen(false);
                navigate(ROUTES.PROFILE);
              }}
              trailing={<LuChevronRight className="size-4 text-text-3" />}
            />
            <MenuRow icon={<LuSunMoon />} label={t("topbar.theme")} trailing={<ThemeToggle />} />
            <MenuRow
              icon={<LuLanguages />}
              label={t("topbar.language")}
              trailing={<LanguageSwitcher />}
            />
            <div className="mx-2 my-1 h-px bg-border" />
            <MenuRow
              icon={<LuLogOut />}
              label={t("topbar.logout")}
              danger
              onClick={() => {
                setIsOpen(false);
                void handleLogout();
              }}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
