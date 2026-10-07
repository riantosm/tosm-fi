import { useTranslation } from "react-i18next";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { LANGUAGES } from "@/constants/languages";
import { useLanguage } from "@/hooks/use-language";

interface LanguageSwitcherProps {
  className?: string;
}

/** Compact ID / EN / JP segmented switch. */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <SegmentedControl
      ariaLabel={t("nav.language")}
      className={className}
      value={language}
      onChange={changeLanguage}
      options={LANGUAGES.map((lang) => ({ value: lang.code, label: lang.code.toUpperCase() }))}
    />
  );
}
