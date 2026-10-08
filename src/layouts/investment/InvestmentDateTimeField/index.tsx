import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuAlarmClock, LuCalendar } from "react-icons/lu";
import { PickerField } from "@/components/molecules/PickerField";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { useLanguage } from "@/hooks/use-language";
import { toIntlLocale } from "@/utils/locale";

interface InvestmentDateTimeFieldProps {
  /** Prefix for the two trigger ids (`<id>-date`, `<id>-time`). */
  id: string;
  value: Date;
  onChange: (date: Date) => void;
}

/** Date + time triggers sharing one DateTimePickerModal — used by every investment entry form. */
export function InvestmentDateTimeField({ id, value, onChange }: InvestmentDateTimeFieldProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <PickerField
          id={`${id}-date`}
          label={t("investment.dateLabel")}
          icon={<LuCalendar />}
          value={value.toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          onClick={() => setIsPickerOpen(true)}
        />
        <PickerField
          id={`${id}-time`}
          label={t("investment.timeLabel")}
          icon={<LuAlarmClock />}
          value={value.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
          onClick={() => setIsPickerOpen(true)}
        />
      </div>

      <DateTimePickerModal
        isOpen={isPickerOpen}
        value={value}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={onChange}
      />
    </>
  );
}
