import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { Reveal } from "@/components/atoms/Reveal";
import { Card } from "@/components/molecules/Card";
import { Chip } from "@/components/molecules/Chip";
import { PageHeader } from "@/components/molecules/PageHeader";
import { ApiEndpointCard } from "@/layouts/settings/ApiEndpointCard";
import { API_DOC_GROUPS } from "@/constants/api-docs";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SettingsApiDocPage() {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(API_DOC_GROUPS[0]?.key ?? "");
  const activeGroup = API_DOC_GROUPS.find((group) => group.key === activeKey) ?? API_DOC_GROUPS[0];

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("apiDoc.title")}
        subtitle={t("apiDoc.subtitle")}
        backTo={ROUTES.SETTINGS}
      />

      {/* Phone: group chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 scrollbar-hide lg:hidden">
        {API_DOC_GROUPS.map((group) => (
          <Chip
            key={group.key}
            size="sm"
            surface="page"
            active={group.key === activeGroup.key}
            onClick={() => setActiveKey(group.key)}
          >
            {t(group.titleKey)}
          </Chip>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Reveal immediate className="hidden lg:block">
          <Card padding="none" className="sticky top-6 flex flex-col gap-0.5 p-2.5">
            {API_DOC_GROUPS.map((group) => {
              const isActive = group.key === activeGroup.key;
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setActiveKey(group.key)}
                  aria-current={isActive}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-control px-3 py-2.5 text-left text-[14px] transition-colors duration-200",
                    isActive
                      ? "bg-primary-soft font-semibold text-primary-text"
                      : "text-text-2 hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <span className="truncate">{t(group.titleKey)}</span>
                  <span
                    className={cn(
                      "shrink-0 text-[12px] tabular",
                      isActive ? "text-primary-text" : "text-text-3",
                    )}
                  >
                    {group.endpoints.length}
                  </span>
                </button>
              );
            })}
          </Card>
        </Reveal>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={activeGroup.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex min-w-0 flex-col gap-3"
          >
            <div className="hidden items-baseline gap-2.5 px-1 lg:flex">
              <h2 className="font-display text-[19px] font-semibold text-text">
                {t(activeGroup.titleKey)}
              </h2>
              <span className="text-[13px] text-text-3">
                {t("apiDoc.endpointCount", { n: activeGroup.endpoints.length })}
              </span>
            </div>
            {activeGroup.endpoints.map((endpoint) => (
              <ApiEndpointCard key={endpoint.id} endpoint={endpoint} />
            ))}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
