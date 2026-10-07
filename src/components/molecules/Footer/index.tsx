import { useTranslation } from "react-i18next";
import { LogoMark } from "@/components/atoms/LogoMark";
import { cn } from "@/utils/cn";

export function Footer({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <footer
      className={cn(
        "flex items-center justify-center gap-2 border-t border-border px-1 pt-[18px] pb-1.5",
        className,
      )}
    >
      <LogoMark size="xs" />
      <span className="text-[12.5px] text-text-3">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </span>
    </footer>
  );
}
