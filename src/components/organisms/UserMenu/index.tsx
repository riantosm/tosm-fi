import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  HiChevronDown,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { cn } from "@/utils/cn";

interface UserMenuProps {
  className?: string;
  /** Name label wrapper — Topbar hides it below md to save space; Sidebar shows it always. */
  nameClassName?: string;
  panelPosition?: "top" | "bottom";
  panelAlign?: "start" | "end";
  showChevron?: boolean;
}

export function UserMenu({
  className,
  nameClassName = "flex",
  panelPosition = "bottom",
  panelAlign = "end",
  showChevron = false,
}: UserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { confirm } = useConfirmDialog();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function handleLogout() {
    setIsOpen(false);
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
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-bl from-primary-400 to-primary-900 uppercase text-white">
          <Words type="xs/bold" as="span">
            {user.nameUser?.slice(0, 2)}
          </Words>
        </div>
        <div className={cn("min-w-0 flex-1 flex-col", nameClassName)}>
          <Words type="sm/bold" as="span" className="max-w-32 truncate text-ink-700 dark:text-ink-300">
            {user?.nameUser}
          </Words>
        </div>
        {showChevron && (
          <HiChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform dark:text-ink-500",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-20 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg dark:border-ink-800 dark:bg-ink-900",
            panelPosition === "top" ? "bottom-full mb-2" : "top-full mt-2",
            panelAlign === "end" ? "right-0" : "left-0",
          )}
        >
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate(ROUTES.PROFILE);
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-ink-600 transition-colors hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <HiOutlineUserCircle className="h-4 w-4 shrink-0" />
            <Words type="sm/regular" as="span" className="flex-1 text-left">
              {t("topbar.editProfile")}
            </Words>
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <HiOutlineArrowRightOnRectangle className="h-4 w-4 shrink-0" />
            <Words type="sm/regular" as="span" className="flex-1 text-left">
              {t("topbar.logout")}
            </Words>
          </button>
        </div>
      )}
    </div>
  );
}
