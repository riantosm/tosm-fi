import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiChevronDown } from "react-icons/hi2";
import { CopyButton } from "@/components/atoms/CopyButton";
import { MethodBadge } from "@/components/atoms/MethodBadge";
import { Words } from "@/components/atoms/Words";
import type { ApiEndpointDoc } from "@/constants/api-docs";
import { cn } from "@/utils/cn";

interface ApiEndpointCardProps {
  endpoint: ApiEndpointDoc;
}

export function ApiEndpointCard({ endpoint }: ApiEndpointCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-3 p-5 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
      >
        <div className="flex flex-1 flex-col gap-2">
          <Words type="lg/bold" className="text-ink-900 dark:text-ink-50">
            {endpoint.title}
          </Words>
          <div className="flex flex-wrap items-center gap-2">
            <MethodBadge method={endpoint.method} />
            <Words
              type="sm/regular"
              as="code"
              className="rounded-md bg-ink-50 px-2 py-0.5 font-mono text-ink-700 dark:bg-ink-800 dark:text-ink-300"
            >
              {endpoint.endpoint}
            </Words>
            <span onClick={(event) => event.stopPropagation()}>
              <CopyButton value={endpoint.endpoint} />
            </span>
          </div>
        </div>
        <HiChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-300 transition-transform dark:text-ink-600",
            isOpen && "rotate-180",
          )}
        />
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 border-t border-ink-100 p-5 dark:border-ink-800">
            <div className="flex flex-col gap-1.5">
              <Words
                type="xs/bold"
                className="uppercase tracking-wide text-ink-400 dark:text-ink-500"
              >
                {t("apiDoc.payload")}
              </Words>
              {endpoint.payload.length === 0 ? (
                <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
                  {t("apiDoc.noPayload")}
                </Words>
              ) : (
                <ul className="flex flex-col gap-1">
                  {endpoint.payload.map((field) => (
                    <li key={field.name} className="flex flex-wrap items-center gap-2">
                      <Words
                        type="sm/bold"
                        as="code"
                        className="font-mono text-ink-800 dark:text-ink-200"
                      >
                        {field.name}
                      </Words>
                      <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
                        {field.type}
                        {field.required
                          ? ` · ${t("apiDoc.required")}`
                          : ` · ${t("apiDoc.optional")}`}
                      </Words>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Words
                    type="xs/bold"
                    className="uppercase tracking-wide text-primary-600 dark:text-primary-400"
                  >
                    {t("apiDoc.success")}
                  </Words>
                  <CopyButton value={endpoint.successExample} />
                </div>
                <pre className="overflow-x-auto rounded-lg bg-ink-50 p-3 font-mono text-xs text-ink-700 scrollbar-hide dark:bg-ink-800 dark:text-ink-300">
                  {endpoint.successExample}
                </pre>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Words
                    type="xs/bold"
                    className="uppercase tracking-wide text-red-500 dark:text-red-400"
                  >
                    {t("apiDoc.error")}
                  </Words>
                  <CopyButton value={endpoint.errorExample} />
                </div>
                <pre className="overflow-x-auto rounded-lg bg-red-50 p-3 font-mono text-xs text-red-700 scrollbar-hide dark:bg-red-500/10 dark:text-red-300">
                  {endpoint.errorExample}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
