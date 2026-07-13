import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowDownTray, HiOutlineDocumentArrowDown, HiOutlineDocumentText, HiOutlineTableCells } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { cn } from "@/utils/cn";
import type { ReportExportFormat } from "@/types/report.types";

const FORMAT_OPTIONS: { format: Exclude<ReportExportFormat, "print">; icon: typeof HiOutlineDocumentText }[] = [
  { format: "pdf", icon: HiOutlineDocumentText },
  { format: "excel", icon: HiOutlineTableCells },
  { format: "csv", icon: HiOutlineDocumentArrowDown },
];

interface ReportExportMenuProps {
  onExport: (format: Exclude<ReportExportFormat, "print">) => void;
  exportingFormat: Exclude<ReportExportFormat, "print"> | null;
}

export function ReportExportMenu({ onExport, exportingFormat }: ReportExportMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-500 dark:bg-primary-500 dark:text-ink-950 dark:hover:bg-primary-400"
      >
        <HiOutlineArrowDownTray className="h-4 w-4" />
        <Words type="sm/bold" as="span">
          {t("reports.export.title")}
        </Words>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1 shadow-lg dark:border-ink-800 dark:bg-ink-900">
          {FORMAT_OPTIONS.map(({ format, icon: Icon }) => (
            <button
              key={format}
              type="button"
              disabled={exportingFormat !== null}
              onClick={() => {
                onExport(format);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
                "text-ink-600 hover:bg-ink-50 disabled:opacity-60 dark:text-ink-300 dark:hover:bg-ink-800",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <Words type="sm/regular" as="span">
                {t(`reports.export.${format}`)}
              </Words>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
