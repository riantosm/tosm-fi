import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowLeft } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { LogoMark } from "@/components/atoms/LogoMark";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Desktop action buttons (right side of the title row). */
  actions?: ReactNode;
  /** Phone app-bar actions (icon buttons). Defaults to nothing — pass compact IconButtons. */
  mobileActions?: ReactNode;
  /** Sub-pages: show a back button (to this path, or history back when `true`). */
  backTo?: string | true;
  /** In-page sub-views (e.g. a detail panel): back button that calls this instead of navigating. */
  onBack?: () => void;
  /** Phone app bar only — for views that draw their own desktop heading. */
  hideOnDesktop?: boolean;
  /** Optional leading element on desktop (e.g. instrument monogram). */
  leading?: ReactNode;
  /** Show the subtitle under the phone app bar too (default true). */
  showSubtitleOnMobile?: boolean;
  className?: string;
}

/**
 * Page title block.
 * - ≥1024px: large Outfit title + subtitle, actions on the right.
 * - <1024px: sticky app bar (logo or back + title + icon actions), subtitle under it.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  mobileActions,
  backTo,
  onBack,
  hideOnDesktop = false,
  leading,
  showSubtitleOnMobile = true,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function goBack() {
    if (onBack) onBack();
    else if (backTo === true) navigate(-1);
    else if (backTo) navigate(backTo);
  }

  const backButton =
    backTo || onBack ? (
      <IconButton
        label={t("common.back")}
        icon={<LuArrowLeft />}
        onClick={goBack}
        variant="surface"
        size="lg"
        tooltip={false}
      />
    ) : null;

  return (
    <>
      {/* Phone / tablet app bar */}
      <div
        className={cn(
          "sticky top-0 z-30 -mx-4 mb-1 flex h-16 items-center gap-2.5 bg-bg/85 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden",
          className,
        )}
      >
        {backButton ?? <LogoMark size="sm" />}
        <h1 className="min-w-0 flex-1 truncate font-display text-[22px] font-semibold text-text">
          {title}
        </h1>
        {mobileActions && <div className="flex shrink-0 items-center gap-1.5">{mobileActions}</div>}
      </div>
      {subtitle && showSubtitleOnMobile && (
        <p className="-mt-1 mb-3 line-clamp-2 text-[13px] leading-relaxed text-text-3 lg:hidden">
          {subtitle}
        </p>
      )}

      {/* Desktop header */}
      {!hideOnDesktop && (
        <div className={cn("hidden items-center justify-between gap-6 lg:flex", className)}>
          <div className="flex min-w-0 items-center gap-4">
            {backButton}
            {leading}
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="truncate font-display text-[30px] font-semibold tracking-[-0.01em] text-text">
                {title}
              </h1>
              {subtitle && <p className="truncate text-[13.5px] text-text-3">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
        </div>
      )}
    </>
  );
}
