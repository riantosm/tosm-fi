import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuMinus, LuPlus } from "react-icons/lu";
import { LandingSectionHead } from "@/layouts/landing/LandingSectionHead";

const QUESTIONS = ["lifetime", "free", "aiQuota", "refund", "payment"] as const;

export function LandingFaq() {
  const { t } = useTranslation();
  const [openKey, setOpenKey] = useState<string | null>(QUESTIONS[0]);

  return (
    <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[380px_1fr] lg:gap-20">
      <LandingSectionHead
        align="left"
        eyebrow={t("landing.faq.eyebrow")}
        title={t("landing.faq.title")}
        subtitle={t("landing.faq.subtitle")}
      />
      <div className="flex flex-col border-t border-border">
        {QUESTIONS.map((key) => {
          const isOpen = openKey === key;
          return (
            <div key={key} className="border-b border-border">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-[18px] font-semibold text-hero-fg sm:text-[19px]">
                  {t(`landing.faq.${key}Q`)}
                </span>
                {isOpen ? (
                  <LuMinus className="size-5 shrink-0 text-text-3" />
                ) : (
                  <LuPlus className="size-5 shrink-0 text-text-3" />
                )}
              </button>
              {isOpen && (
                <p className="max-w-[600px] animate-fade-in pb-6 text-[15px] leading-[1.6] text-text-2">
                  {t(`landing.faq.${key}A`)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
