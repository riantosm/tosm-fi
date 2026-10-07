import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuHash } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { ColorWheel } from "@/components/atoms/ColorWheel";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { useDialogSession } from "@/hooks/use-dialog-session";

interface CustomColorModalProps {
  isOpen: boolean;
  value: string;
  onClose: () => void;
  onApply: (hex: string) => void;
}

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** "Warna custom": hue ring + saturation/value square, plus a hex field. */
export function CustomColorModal({ isOpen, value, onClose, onApply }: CustomColorModalProps) {
  const { t } = useTranslation();
  const session = useDialogSession(isOpen);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onBack={onClose}
      size="sm"
      title={t("common.customColor")}
      subtitle={t("common.customColorSubtitle")}
    >
      <CustomColorFields key={session} value={value} onClose={onClose} onApply={onApply} />
    </Modal>
  );
}

function CustomColorFields({ value, onClose, onApply }: Omit<CustomColorModalProps, "isOpen">) {
  const { t } = useTranslation();
  const [color, setColor] = useState(value);
  const [hexDraft, setHexDraft] = useState(value.replace("#", "").toUpperCase());
  const [wheelKey, setWheelKey] = useState(0);

  function handleWheelChange(hex: string) {
    setColor(hex);
    setHexDraft(hex.replace("#", "").toUpperCase());
  }

  function handleHexChange(raw: string) {
    const cleaned = raw
      .replace(/[^0-9a-fA-F]/g, "")
      .slice(0, 6)
      .toUpperCase();
    setHexDraft(cleaned);
    const normalized = `#${cleaned}`;
    if (HEX_PATTERN.test(normalized)) {
      setColor(normalized);
      setWheelKey((key) => key + 1);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center py-1">
        <ColorWheel key={wheelKey} value={color} onChange={handleWheelChange} />
      </div>

      <div className="flex items-end gap-3">
        <span
          className="size-12 shrink-0 rounded-[14px] shadow-card transition-colors duration-200"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <FormField label={t("common.hexCode")} htmlFor="custom-color-hex">
            <Input
              id="custom-color-hex"
              value={hexDraft}
              onChange={(event) => handleHexChange(event.target.value)}
              startIcon={<LuHash />}
              className="font-mono tracking-[0.06em] uppercase"
              maxLength={7}
            />
          </FormField>
        </div>
      </div>

      <ModalActions>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          leftIcon={<LuCheck />}
          onClick={() => onApply(color)}
          disabled={!HEX_PATTERN.test(color)}
        >
          {t("common.applyColor")}
        </Button>
      </ModalActions>
    </div>
  );
}
