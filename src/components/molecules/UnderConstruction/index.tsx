import { useTranslation } from "react-i18next";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";

interface UnderConstructionProps {
  title: string;
}

export function UnderConstruction({ title }: UnderConstructionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink-200 py-24 text-center dark:border-ink-800">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">
        <HiOutlineWrenchScrewdriver className="h-8 w-8" />
      </div>
      <div className="flex flex-col gap-1">
        <Words as="h2" type="lg/bold" className="text-ink-700 dark:text-ink-300">
          {title}
        </Words>
        <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
          {t("common.underConstruction")}
        </Words>
      </div>
    </div>
  );
}
