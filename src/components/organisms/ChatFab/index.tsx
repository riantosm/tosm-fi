import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuSparkles } from "react-icons/lu";
import { Tooltip } from "@/components/atoms/Tooltip";
import { useQuickAdd } from "@/hooks/use-quick-add";

/** Desktop floating Catat Cepat button (bottom-right). Hidden while the panel is open. */
export function ChatFab() {
  const { t } = useTranslation();
  const { isAssistantOpen, openAssistant } = useQuickAdd();

  return (
    <div className="fixed right-7 bottom-7 z-40 hidden lg:block">
      <AnimatePresence>
        {!isAssistantOpen && (
          <m.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            <Tooltip content={t("nav.quickAdd")}>
              <button
                type="button"
                onClick={openAssistant}
                aria-label={t("nav.quickAdd")}
                className="pressable group flex size-[60px] items-center justify-center rounded-full bg-primary text-primary-fg shadow-[0_10px_24px_color-mix(in_oklab,var(--primary)_40%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_color-mix(in_oklab,var(--primary)_48%,transparent)]"
              >
                <LuSparkles className="size-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              </button>
            </Tooltip>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
