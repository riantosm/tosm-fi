import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineHashtag, HiXMark } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { ColorWheel } from "@/components/atoms/ColorWheel";

interface CustomColorPanelProps {
  value: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function CustomColorPanel({ value, onChange, onClose }: CustomColorPanelProps) {
  const { t } = useTranslation();
  const [isHexInputVisible, setIsHexInputVisible] = useState(false);
  const [hexDraft, setHexDraft] = useState(value);

  function submitHexDraft() {
    const normalized = hexDraft.startsWith("#") ? hexDraft : `#${hexDraft}`;
    if (HEX_PATTERN.test(normalized)) onChange(normalized);
  }

  function toggleHexInput() {
    const next = !isHexInputVisible;
    if (next) setHexDraft(value);
    setIsHexInputVisible(next);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-800">
      <div className="flex items-center justify-between">
        <Words type="sm/bold" className="text-ink-800 dark:text-ink-100">
          {t("common.customColor")}
        </Words>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleHexInput}
            aria-label="Hex"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700"
          >
            <HiOutlineHashtag className="h-4 w-4" />
          </button>
          <div
            className="h-7 w-7 shrink-0 rounded-full border border-ink-200 dark:border-ink-700"
            style={{ background: value }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isHexInputVisible && (
        <input
          value={hexDraft}
          onChange={(event) => setHexDraft(event.target.value)}
          onBlur={submitHexDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitHexDraft();
          }}
          className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 font-mono text-sm text-ink-800 outline-none focus:border-primary-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
        />
      )}

      <ColorWheel value={value} onChange={onChange} />
    </div>
  );
}
