import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { IconLoader } from "@/components/atoms/IconLoader";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import type { InvestmentAccount, InvestmentAccountInput } from "@/types/instrument.types";

interface InvestmentAccountFormModalProps {
  isOpen: boolean;
  account?: InvestmentAccount | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: InvestmentAccountInput) => void;
  onDelete?: (id: string) => void;
}

export function InvestmentAccountFormModal({
  isOpen,
  account,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: InvestmentAccountFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <InvestmentAccountFormFields
          account={account}
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

interface InvestmentAccountFormFieldsProps {
  account?: InvestmentAccount | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onSubmit: (input: InvestmentAccountInput) => void;
  onDelete?: (id: string) => void;
}

function InvestmentAccountFormFields({
  account,
  isSubmitting,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: InvestmentAccountFormFieldsProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(account?.nameInvestmentAccount ?? "");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ nameInvestmentAccount: name.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {account ? t("investment.editAccountTitle") : t("investment.addAccountTitle")}
        </Words>

        <div className="flex shrink-0 items-center gap-1">
          {account && (
            <button
              type="button"
              onClick={() => onDelete?.(account.idInvestmentAccount)}
              disabled={isDeleting}
              aria-label={t("investment.deleteButton")}
              title={t("investment.deleteButton")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              {isDeleting ? (
                <IconLoader className="h-4 w-4 animate-spin" />
              ) : (
                <HiOutlineTrash className="h-4 w-4" />
              )}
            </button>
          )}
          <ModalCloseButton onClose={onClose} />
        </div>
      </div>

      <FormField label={t("investment.accountNameLabel")} htmlFor="account-name">
        <Input
          id="account-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("investment.accountNamePlaceholder")}
          required
        />
      </FormField>

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
