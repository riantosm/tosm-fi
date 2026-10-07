import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { LuDownload, LuFileCode2, LuFileSpreadsheet, LuFileText } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Popover } from "@/components/molecules/Popover";
import { cn } from "@/utils/cn";
import type { ReportExportFormat } from "@/types/report.types";

type ExportFormat = Exclude<ReportExportFormat, "print">;

const FORMAT_OPTIONS: { format: ExportFormat; icon: IconType; tileClass: string }[] = [
  { format: "pdf", icon: LuFileText, tileClass: "bg-expense-soft text-expense-text" },
  { format: "excel", icon: LuFileSpreadsheet, tileClass: "bg-income-soft text-income-text" },
  { format: "csv", icon: LuFileCode2, tileClass: "bg-primary-soft text-primary-text" },
];

interface ReportExportMenuProps {
  onExport: (format: ExportFormat) => void;
  exportingFormat: ExportFormat | null;
  /** button = labelled primary button (desktop); icon = round app-bar button (phone). */
  variant?: "button" | "icon";
}

/** "Export" — PDF / Excel / CSV of the current report period. */
export function ReportExportMenu({
  onExport,
  exportingFormat,
  variant = "button",
}: ReportExportMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isExporting = exportingFormat !== null;

  const trigger =
    variant === "icon" ? (
      <IconButton
        label={t("reports.export.title")}
        icon={isExporting ? <IconLoader className="animate-spin" /> : <LuDownload />}
        variant="primary"
        size="lg"
        tooltip={false}
        onClick={() => setIsOpen((prev) => !prev)}
      />
    ) : (
      <Button
        type="button"
        leftIcon={<LuDownload />}
        isLoading={isExporting}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {t("reports.export.title")}
      </Button>
    );

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={trigger}
      align="end"
      panelClassName="w-[340px]"
    >
      <div className="flex flex-col gap-0.5">
        <span className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-text-3 uppercase">
          {t("reports.export.title")}
        </span>
        {FORMAT_OPTIONS.map(({ format, icon: Icon, tileClass }) => (
          <button
            key={format}
            type="button"
            disabled={isExporting}
            onClick={() => {
              onExport(format);
              setIsOpen(false);
            }}
            className="group flex w-full items-center gap-3 rounded-control px-2.5 py-2.5 text-left transition-colors duration-200 hover:bg-surface-2 disabled:opacity-60"
          >
            <span
              className={cn(
                "flex size-[38px] shrink-0 items-center justify-center rounded-[12px]",
                tileClass,
              )}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="truncate text-[14px] font-semibold text-text">
                {t(`reports.export.${format}`)}
              </span>
              <span className="truncate text-[12.5px] text-text-3">
                {t(`reports.export.${format}Description`)}
              </span>
            </span>
            {exportingFormat === format ? (
              <IconLoader className="size-[18px] shrink-0 animate-spin text-primary-text" />
            ) : (
              <LuDownload className="size-[18px] shrink-0 text-text-3 transition-colors group-hover:text-primary-text" />
            )}
          </button>
        ))}
      </div>
    </Popover>
  );
}
