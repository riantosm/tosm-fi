import { useEffect, useRef, useState } from "react";
import { HiCheck, HiChevronDown, HiOutlineGlobeAlt } from "react-icons/hi2";
import { LANGUAGES } from "@/constants/languages";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";

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
        className="flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
      >
        <HiOutlineGlobeAlt className="h-4 w-4 text-ink-400 dark:text-ink-500" />
        <span className="leading-none">{current.flag}</span>
        <span>{current.nativeLabel}</span>
        <HiChevronDown
          className={cn(
            "h-3.5 w-3.5 text-ink-400 transition-transform dark:text-ink-500",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg dark:border-ink-800 dark:bg-ink-900">
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
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "font-medium text-primary-700 dark:text-primary-400"
                    : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800",
                )}
              >
                <span className="text-base leading-none">{option.flag}</span>
                <span className="flex-1 text-left">{option.nativeLabel}</span>
                {isActive && <HiCheck className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
