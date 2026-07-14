import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiCheck, HiChevronDown, HiOutlineGlobeAlt } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { LANGUAGES } from "@/constants/languages";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/utils/cn";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 px-4 py-3 text-ink-600 transition-colors hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-900 dark:bg-ink-800"
      >
        <HiOutlineGlobeAlt className="h-5 w-5 shrink-0 text-ink-400 dark:text-ink-500" />
        <Words type="sm/bold" as="span" className="flex-1 text-left">
          {t("nav.language")}
        </Words>
        <HiChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-300 transition-transform dark:text-ink-600",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-ink-100 border-t border-ink-100 dark:divide-ink-800 dark:border-ink-800">
            {LANGUAGES.map((option) => {
              const isActive = language === option.code;

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => changeLanguage(option.code)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 transition-colors",
                    isActive
                      ? "text-primary-700 dark:text-primary-400"
                      : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800",
                  )}
                >
                  <span className="text-base leading-none">{option.flag}</span>
                  <Words
                    type={isActive ? "sm/bold" : "sm/regular"}
                    as="span"
                    className="flex-1 text-left"
                  >
                    {option.nativeLabel}
                  </Words>
                  {isActive && <HiCheck className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
