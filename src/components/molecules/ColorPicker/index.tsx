import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuPipette } from "react-icons/lu";
import { CustomColorModal } from "@/components/molecules/ColorPicker/CustomColorPanel";
import { cn } from "@/utils/cn";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  presets: string[];
}

/** Round swatches + a pipette that opens the "Warna custom" dialog (wheel + hex). */
export function ColorPicker({ value, onChange, presets }: ColorPickerProps) {
  const { t } = useTranslation();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const isPreset = presets.some((preset) => preset.toLowerCase() === value.toLowerCase());

  return (
    <>
      <div className="-mx-1 flex flex-nowrap gap-1.5 overflow-x-auto px-1 py-1 scrollbar-hide sm:justify-between">
        {presets.map((preset) => {
          const selected = value.toLowerCase() === preset.toLowerCase();
          return (
            <button
              key={preset}
              type="button"
              title={preset}
              onClick={() => onChange(preset)}
              aria-label={preset}
              aria-pressed={selected}
              className="pressable flex size-9 shrink-0 items-center justify-center rounded-full"
            >
              <span
                className={cn(
                  "rounded-full transition-all duration-200",
                  selected
                    ? "size-6 ring-2 ring-offset-[3px] ring-offset-surface"
                    : "size-7 hover:scale-110",
                )}
                style={{ backgroundColor: preset, ["--tw-ring-color" as string]: preset }}
              />
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsCustomOpen(true)}
          aria-label={t("common.customColor")}
          title={t("common.customColor")}
          className={cn(
            "pressable flex size-9 shrink-0 items-center justify-center rounded-full",
            isPreset
              ? "border border-border bg-surface-2 text-text-2 hover:bg-surface-3 hover:text-text"
              : "ring-2 ring-offset-[3px] ring-offset-surface",
          )}
          style={
            !isPreset ? { backgroundColor: value, ["--tw-ring-color" as string]: value } : undefined
          }
        >
          {isPreset && <LuPipette className="size-4" />}
        </button>
      </div>

      <CustomColorModal
        isOpen={isCustomOpen}
        value={value}
        onClose={() => setIsCustomOpen(false)}
        onApply={(hex) => {
          onChange(hex);
          setIsCustomOpen(false);
        }}
      />
    </>
  );
}
