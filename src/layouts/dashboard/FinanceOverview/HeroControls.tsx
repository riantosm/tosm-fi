import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuCheck, LuLanguages } from "react-icons/lu";
import { Tooltip } from "@/components/atoms/Tooltip";
import { LANGUAGES } from "@/constants/languages";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";

interface HeroIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  icon: ReactNode;
  size?: "sm" | "md";
  tooltip?: boolean;
}

/** Translucent round button that sits on the hero gradient (theme, language, search). */
export function HeroIconButton({
  label,
  icon,
  size = "md",
  tooltip = true,
  className,
  type = "button",
  ...rest
}: HeroIconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "pressable inline-flex shrink-0 items-center justify-center rounded-full bg-surface/50 text-hero-fg ring-1 ring-hero-fg/5 ring-inset hover:bg-surface/80",
        size === "md" ? "size-10 [&_svg]:size-[17px]" : "size-9 [&_svg]:size-4",
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );

  return tooltip ? <Tooltip content={label}>{button}</Tooltip> : button;
}

/** Hero language picker — icon button opening a small menu below it. */
export function HeroLanguageMenu() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
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
    <div ref={containerRef} className="relative">
      <HeroIconButton
        label={t("topbar.language")}
        icon={<LuLanguages />}
        tooltip={!isOpen}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((prev) => !prev)}
      />

      <AnimatePresence>
        {isOpen && (
          <m.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute top-full right-0 z-30 mt-2 w-52 rounded-[18px] bg-surface p-1.5 shadow-pop"
          >
            {LANGUAGES.map((option) => {
              const isActive = option.code === language;
              return (
                <button
                  key={option.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    changeLanguage(option.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-[13.5px] transition-colors",
                    isActive
                      ? "bg-primary-soft font-semibold text-primary-text"
                      : "text-text-2 hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <span className="text-base leading-none">{option.flag}</span>
                  <span className="flex-1">{option.nativeLabel}</span>
                  {isActive && <LuCheck className="size-4" />}
                </button>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
