import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuChevronDown, LuCopy } from "react-icons/lu";
import { CopyButton } from "@/components/atoms/CopyButton";
import { MethodBadge } from "@/components/atoms/MethodBadge";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { useToast } from "@/hooks/use-toast";
import type { ApiEndpointDoc } from "@/constants/api-docs";
import { cn } from "@/utils/cn";

type ExampleTab = "success" | "error";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ApiEndpointCardProps {
  endpoint: ApiEndpointDoc;
}

/** One endpoint: method + path header; expands to the payload table and success/error examples. */
export function ApiEndpointCard({ endpoint }: ApiEndpointCardProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<ExampleTab>("success");
  const example = tab === "success" ? endpoint.successExample : endpoint.errorExample;

  async function copyExample() {
    try {
      await navigator.clipboard.writeText(example);
      showToast(t("common.copySuccess"), "success");
    } catch {
      showToast(t("common.copyError"), "error");
    }
  }

  return (
    <div
      className={cn(
        "rounded-card bg-surface shadow-card transition-[box-shadow] duration-300",
        isOpen ? "ring-[1.5px] ring-primary" : "ring-0",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3.5 lg:px-5 lg:py-4">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left lg:gap-3.5"
        >
          <MethodBadge method={endpoint.method} />
          <span className="flex min-w-0 flex-col gap-px">
            <code className="truncate font-mono text-[13.5px] font-semibold text-text lg:text-[14px]">
              {endpoint.endpoint}
            </code>
            <span className="truncate text-[12.5px] text-text-3">{endpoint.title}</span>
          </span>
        </button>
        <CopyButton value={endpoint.endpoint} className="hidden sm:inline-flex" />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={t("apiDoc.toggleDetail")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-surface-2 hover:text-text"
        >
          <LuChevronDown
            className={cn("size-[18px] transition-transform duration-300", isOpen && "rotate-180")}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 px-4 pb-4 lg:grid-cols-2 lg:px-5 lg:pb-5">
              <div className="flex min-w-0 flex-col gap-2">
                <span className="text-[13px] font-semibold text-text-2">{t("apiDoc.payload")}</span>
                {endpoint.payload.length === 0 ? (
                  <p className="rounded-control bg-surface-2 px-3.5 py-3 text-[13px] text-text-3">
                    {t("apiDoc.noPayload")}
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-control border border-border">
                    {endpoint.payload.map((field, index) => (
                      <div
                        key={field.name}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5",
                          index % 2 === 1 && "bg-surface-2/60",
                        )}
                      >
                        <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] font-semibold text-text">
                          {field.name}
                        </code>
                        <code className="shrink-0 font-mono text-[12px] text-text-3">
                          {field.type}
                        </code>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            field.required
                              ? "bg-expense-soft text-expense-text"
                              : "bg-surface-2 text-text-2",
                          )}
                        >
                          {field.required ? t("apiDoc.required") : t("apiDoc.optional")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <SegmentedControl
                    options={[
                      { value: "success", label: t("apiDoc.success") },
                      { value: "error", label: t("apiDoc.error") },
                    ]}
                    value={tab}
                    onChange={setTab}
                    activeClassName={tab === "success" ? "text-income-text" : "text-expense-text"}
                    ariaLabel={t("apiDoc.examples")}
                  />
                  <button
                    type="button"
                    onClick={() => void copyExample()}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-primary-text transition-colors hover:text-primary"
                  >
                    <LuCopy className="size-3.5" />
                    {t("common.copy")}
                  </button>
                </div>
                <pre
                  key={tab}
                  className="max-h-[360px] animate-fade-in overflow-auto rounded-[16px] bg-code-bg p-4 font-mono text-[12.5px] leading-[1.6] text-code-fg scrollbar-hide"
                >
                  {example}
                </pre>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
