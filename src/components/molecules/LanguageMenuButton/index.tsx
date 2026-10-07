import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { LuCheck, LuChevronUp, LuLanguages } from "react-icons/lu";
import { LANGUAGES } from "@/constants/languages";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";

/** Pill language picker opening upward (auth pages). */
export function LanguageMenuButton() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((option) => option.code === language) ?? LANGUAGES[0];

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

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="pressable flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-3.5 text-[13px] font-medium text-text-2 hover:border-border-strong hover:text-text"
      >
        <LuLanguages className="size-4 text-text-3" />
        {current.nativeLabel}
        <LuChevronUp
          className={cn(
            "size-3.5 text-text-3 transition-transform duration-200",
            !isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-[18px] bg-surface p-1.5 shadow-pop"
          >
            {LANGUAGES.map((option) => {
              const isActive = option.code === language;
              return (
                <button
                  key={option.code}
                  type="button"
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
