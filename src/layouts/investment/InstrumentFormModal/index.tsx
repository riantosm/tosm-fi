import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { IconLoader } from "@/components/atoms/IconLoader";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import type { Instrument, InstrumentInput } from "@/types/instrument.types";

interface InstrumentFormModalProps {
  isOpen: boolean;
  instrument?: Instrument | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: InstrumentInput) => void;
  onDelete?: (id: string) => void;
}

export function InstrumentFormModal({
  isOpen,
  instrument,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: InstrumentFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <InstrumentFormFields
          instrument={instrument}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Modal>
  );
}

interface InstrumentFormFieldsProps {
  instrument?: Instrument | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: InstrumentInput) => void;
  onDelete?: (id: string) => void;
}

function InstrumentFormFields({
  instrument,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: InstrumentFormFieldsProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(instrument?.nameInstrument ?? "");
  const [color, setColor] = useState(instrument?.color ?? WALLET_COLOR_PRESETS[0]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ nameInstrument: name.trim(), color });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {instrument ? t("investment.editTitle") : t("investment.addTitle")}
        </Words>

        <div className="flex shrink-0 items-center gap-1">
          {instrument && (
            <Tooltip content={t("investment.deleteButton")}>
              <button
                type="button"
                onClick={() => onDelete?.(instrument.idInstrument)}
                disabled={isDeleting}
                aria-label={t("investment.deleteButton")}
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                {isDeleting ? (
                  <IconLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <HiOutlineTrash className="h-4 w-4" />
                )}
              </button>
            </Tooltip>
          )}
          <ModalCloseButton onClose={onClose} />
        </div>
      </div>

      <FormField label={t("investment.nameLabel")} htmlFor="instrument-name">
        <Input
          id="instrument-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("investment.namePlaceholder")}
          required
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {t("investment.colorLabel")}
        </Words>
        <ColorPicker value={color} onChange={setColor} presets={WALLET_COLOR_PRESETS} />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          <Words type="sm/bold" as="span">
            {t("common.cancel")}
          </Words>
        </Button>
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          <Words type="sm/bold" as="span">
            {t("common.confirm")}
          </Words>
        </Button>
      </div>
    </form>
  );
}
