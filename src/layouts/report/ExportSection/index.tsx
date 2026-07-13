import { createElement } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineDocumentArrowDown, HiOutlineDocumentText, HiOutlineTableCells } from "react-icons/hi2";
import type { IconType } from "react-icons";
import { Words } from "@/components/atoms/Words";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/utils/cn";
import type { ReportExportFormat } from "@/types/report.types";

type ExportFormat = Exclude<ReportExportFormat, "print">;

interface CardConfig {
  format: ExportFormat;
  icon: IconType;
  iconBg: string;
  iconColor: string;
}

const CARD_CONFIGS: CardConfig[] = [
  {
    format: "pdf",
    icon: HiOutlineDocumentText,
    iconBg: "bg-red-100 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    format: "excel",
    icon: HiOutlineTableCells,
    iconBg: "bg-primary-100 dark:bg-primary-500/15",
    iconColor: "text-primary-600 dark:text-primary-400",
  },
  {
    format: "csv",
    icon: HiOutlineDocumentArrowDown,
    iconBg: "bg-purple-100 dark:bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

interface ExportSectionProps {
  onExport: (format: ExportFormat) => void;
  exportingFormat: ExportFormat | null;
}

export function ExportSection({ onExport, exportingFormat }: ExportSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <Words type="base/bold" className="text-ink-900 dark:text-ink-50">
        {t("reports.export.title")}
      </Words>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CARD_CONFIGS.map((config) => (
          <div
            key={config.format}
            className="flex flex-col gap-3 rounded-2xl border border-ink-200 p-4 dark:border-ink-800"
          >
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", config.iconBg)}>
              {createElement(config.icon, { className: cn("h-4.5 w-4.5", config.iconColor) })}
            </div>
            <div>
              <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                {t(`reports.export.${config.format}`)}
              </Words>
              <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
                {t(`reports.export.${config.format}Description`)}
              </Words>
            </div>
            <Button
              variant="secondary"
              onClick={() => onExport(config.format)}
              isLoading={exportingFormat === config.format}
              disabled={exportingFormat !== null && exportingFormat !== config.format}
              className="w-full"
            >
              <Words type="sm/bold" as="span">
                {t("reports.export.action")}
              </Words>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
