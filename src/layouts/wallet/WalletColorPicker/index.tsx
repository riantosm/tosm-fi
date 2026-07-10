import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineEyeDropper } from "react-icons/hi2";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { CustomColorPanel } from "@/layouts/wallet/CustomColorPanel";
import { cn } from "@/utils/cn";

interface WalletColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function WalletColorPicker({ value, onChange }: WalletColorPickerProps) {
  const { t } = useTranslation();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const isPreset = WALLET_COLOR_PRESETS.includes(value);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
        {WALLET_COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              onChange(preset);
              setIsCustomOpen(false);
            }}
            aria-label={preset}
            className={cn(
              "h-9 w-9 shrink-0 rounded-full border-2 transition-transform",
              value === preset && !isCustomOpen
                ? "border-primary-500"
                : "border-transparent hover:scale-105",
            )}
            style={{ background: preset }}
          />
        ))}
        <button
          type="button"
          onClick={() => setIsCustomOpen((prev) => !prev)}
          aria-label={t("wallet.customColor")}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
            !isPreset || isCustomOpen
              ? "border-primary-500"
              : "border-ink-200 dark:border-ink-700",
          )}
          style={!isPreset ? { background: value } : undefined}
        >
          {isPreset && <HiOutlineEyeDropper className="h-4 w-4 text-ink-400" />}
        </button>
      </div>

      {isCustomOpen && (
        <CustomColorPanel
          value={value}
          onChange={onChange}
          onClose={() => setIsCustomOpen(false)}
        />
      )}
    </div>
  );
}
