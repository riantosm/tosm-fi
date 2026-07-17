import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import { Tooltip } from "@/components/atoms/Tooltip";

interface AddInstrumentCardProps {
  onClick: () => void;
}

export function AddInstrumentCard({ onClick }: AddInstrumentCardProps) {
  const { t } = useTranslation();

  return (
    <Tooltip content={t("investment.addTitle")} wrapperClassName="w-56 shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={t("investment.addTitle")}
        className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400"
      >
        <HiOutlinePlus className="h-6 w-6" />
      </button>
    </Tooltip>
  );
}
