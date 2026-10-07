import { useTranslation } from "react-i18next";
import { LuGalleryHorizontal, LuLayoutGrid } from "react-icons/lu";
import { ViewModeToggle } from "@/components/molecules/ViewModeToggle";
import type { InstrumentViewMode } from "@/hooks/use-instrument-view-mode";

interface InstrumentViewModeToggleProps {
  value: InstrumentViewMode;
  onChange: (mode: InstrumentViewMode) => void;
}

/** Instrument cards as a horizontal carousel or a wrapping grid. */
export function InstrumentViewModeToggle({ value, onChange }: InstrumentViewModeToggleProps) {
  const { t } = useTranslation();
  return (
    <ViewModeToggle
      options={[
        { value: "carousel", icon: LuGalleryHorizontal, label: t("investment.viewCarousel") },
        { value: "grid", icon: LuLayoutGrid, label: t("investment.viewGrid") },
      ]}
      value={value}
      onChange={onChange}
      ariaLabel={t("investment.toggleInstrumentView")}
    />
  );
}
