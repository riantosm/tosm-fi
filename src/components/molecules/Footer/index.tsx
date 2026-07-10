import { useTranslation } from "react-i18next";
import { Words } from "@/components/atoms/Words";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-6 text-center">
      <Words type="xs/regular" className="text-ink-400 dark:text-ink-500">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </Words>
    </footer>
  );
}
