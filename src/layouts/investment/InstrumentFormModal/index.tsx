import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuTrash2, LuType } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Monogram } from "@/components/atoms/Monogram";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { useDialogSession } from "@/hooks/use-dialog-session";
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

const FORM_ID = "instrument-form";

export function InstrumentFormModal(props: InstrumentFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <InstrumentFormDialog key={session} {...props} />;
}

function InstrumentFormDialog({
  isOpen,
  instrument: instrumentProp,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: InstrumentFormModalProps) {
  const { t } = useTranslation();
  // Frozen for this dialog's lifetime so the exit animation keeps the same content.
  const [instrument] = useState(instrumentProp ?? null);
  const [name, setName] = useState(instrument?.nameInstrument ?? "");
  const [color, setColor] = useState(instrument?.color ?? WALLET_COLOR_PRESETS[0]);
  const isBusy = Boolean(isSubmitting || isDeleting);
  const accountCount =
    instrument?.investmentAccounts.filter((account) => !account.isDeleted).length ?? 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ nameInstrument: name.trim(), color });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={instrument ? t("investment.editTitle") : t("investment.addTitle")}
      subtitle={
        instrument
          ? `${instrument.nameInstrument} · ${t("investment.accountsShort", { count: accountCount })}`
          : t("investment.addInstrumentSubtitle")
      }
      footer={
        <div className="flex items-center gap-2.5">
          {instrument && onDelete && (
            <IconButton
              label={t("investment.deleteInstrument")}
              icon={<LuTrash2 />}
              variant="danger"
              size="lg"
              className="size-[50px]"
              onClick={() => onDelete(instrument.idInstrument)}
              disabled={isBusy}
            />
          )}
          <ModalActions className="flex-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              leftIcon={<LuCheck />}
              isLoading={isSubmitting}
              disabled={isBusy || !name.trim()}
            >
              {t("investment.save")}
            </Button>
          </ModalActions>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <FormField label={t("investment.nameLabel")} htmlFor="instrument-name">
          <Input
            id="instrument-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("investment.namePlaceholder")}
            startIcon={<LuType />}
            required
            autoFocus={!instrument}
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-2">
            {t("investment.colorLabel")}
          </span>
          <ColorPicker value={color} onChange={setColor} presets={WALLET_COLOR_PRESETS} />
        </div>

        <div className="flex items-center gap-3 rounded-[18px] border border-border px-3.5 py-3">
          <Monogram
            name={name.trim() || t("investment.namePreview")}
            color={color}
            variant="solid"
            shape="square"
            size="md"
            className="transition-colors duration-300"
          />
          <span className="flex min-w-0 flex-col gap-px">
            <span className="truncate text-[14px] font-semibold text-text">
              {name.trim() || t("investment.namePreview")}
            </span>
            <span className="text-[12px] text-text-3">{t("investment.cardPreview")}</span>
          </span>
        </div>
      </form>
    </Modal>
  );
}
