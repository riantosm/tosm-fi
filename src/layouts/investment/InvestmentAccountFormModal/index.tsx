import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuLandmark, LuLock, LuPlus, LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Monogram } from "@/components/atoms/Monogram";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { useDialogSession } from "@/hooks/use-dialog-session";
import type {
  Instrument,
  InvestmentAccount,
  InvestmentAccountInput,
} from "@/types/instrument.types";

interface InvestmentAccountFormModalProps {
  isOpen: boolean;
  /** The instrument the account lives in (shown locked). */
  instrument: Instrument | null;
  account?: InvestmentAccount | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: InvestmentAccountInput) => void;
  onDelete?: (id: string) => void;
}

const FORM_ID = "investment-account-form";

export function InvestmentAccountFormModal(props: InvestmentAccountFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <InvestmentAccountFormDialog key={session} {...props} />;
}

function InvestmentAccountFormDialog({
  isOpen,
  instrument: instrumentProp,
  account: accountProp,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: InvestmentAccountFormModalProps) {
  const { t } = useTranslation();
  // Frozen for this dialog's lifetime so the exit animation keeps the same content.
  const [instrument] = useState(instrumentProp);
  const [account] = useState(accountProp ?? null);
  const [name, setName] = useState(account?.nameInvestmentAccount ?? "");
  const isBusy = Boolean(isSubmitting || isDeleting);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ nameInvestmentAccount: name.trim() });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={account ? t("investment.editAccountTitle") : t("investment.addAccountTitle")}
      subtitle={
        instrument ? t("investment.inInstrument", { name: instrument.nameInstrument }) : undefined
      }
      footer={
        <div className="flex items-center gap-2.5">
          {account && onDelete && (
            <IconButton
              label={t("investment.deleteAccount")}
              icon={<LuTrash2 />}
              variant="danger"
              size="lg"
              className="size-[50px]"
              onClick={() => onDelete(account.idInvestmentAccount)}
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
              leftIcon={account ? <LuCheck /> : <LuPlus />}
              isLoading={isSubmitting}
              disabled={isBusy || !name.trim()}
            >
              {account ? t("investment.save") : t("investment.addAccount")}
            </Button>
          </ModalActions>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        {instrument && (
          <div className="flex items-center gap-2.5 rounded-control bg-surface-2 px-3.5 py-2.5">
            <Monogram
              name={instrument.nameInstrument}
              color={instrument.color}
              variant="solid"
              shape="square"
              size="xs"
              className="size-7 text-[10px]"
            />
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-text">
              {instrument.nameInstrument}
            </span>
            <LuLock
              className="size-4 shrink-0 text-text-3"
              aria-label={t("investment.instrumentLocked")}
            />
          </div>
        )}

        <FormField
          label={t("investment.accountNameLabel")}
          htmlFor="account-name"
          helper={t("investment.accountNameHelper")}
        >
          <Input
            id="account-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("investment.accountNamePlaceholder")}
            startIcon={<LuLandmark />}
            required
            autoFocus={!account}
          />
        </FormField>
      </form>
    </Modal>
  );
}
