import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineStar, HiOutlineTrash } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { IconLoader } from "@/components/atoms/IconLoader";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { WalletColorPicker } from "@/layouts/wallet/WalletColorPicker";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { CURRENCIES } from "@/constants/currencies";
import { useCurrency } from "@/hooks/use-currency";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import type { WalletAccount, WalletInput } from "@/types/wallet.types";

interface WalletFormModalProps {
  isOpen: boolean;
  wallet?: WalletAccount | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  onClose: () => void;
  onSubmit: (input: WalletInput) => void;
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
}

export function WalletFormModal({
  isOpen,
  wallet,
  isSubmitting,
  isDeleting,
  isSettingPrimary,
  onClose,
  onSubmit,
  onDelete,
  onSetPrimary,
}: WalletFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <WalletFormFields
          wallet={wallet}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          isSettingPrimary={isSettingPrimary}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onSetPrimary={onSetPrimary}
        />
      )}
    </Modal>
  );
}

interface WalletFormFieldsProps {
  wallet?: WalletAccount | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  onClose: () => void;
  onSubmit: (input: WalletInput) => void;
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
}

function WalletFormFields({
  wallet,
  isSubmitting,
  isDeleting,
  isSettingPrimary,
  onClose,
  onSubmit,
  onDelete,
  onSetPrimary,
}: WalletFormFieldsProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const currencySymbol = CURRENCIES.find((option) => option.code === currency)?.symbol ?? "IDR";
  const [name, setName] = useState(wallet?.name ?? "");
  const [color, setColor] = useState(wallet?.color ?? WALLET_COLOR_PRESETS[0]);
  const [balanceInput, setBalanceInput] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    const balance = parseFormattedNumber(balanceInput);
    onSubmit({ name: name.trim(), color, ...(wallet ? {} : { balance }) });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
          {wallet ? t("wallet.editTitle") : t("wallet.addTitle")}
        </Words>

        {wallet && (
          <div className="flex shrink-0 items-center gap-1">
            {!wallet.isPrimary && (
              <button
                type="button"
                onClick={() => onSetPrimary?.(wallet.id)}
                disabled={isSettingPrimary}
                aria-label={t("wallet.setPrimaryButton")}
                title={t("wallet.setPrimaryButton")}
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-primary-600 disabled:opacity-60 dark:hover:bg-ink-800 dark:hover:text-primary-400"
              >
                {isSettingPrimary ? (
                  <IconLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <HiOutlineStar className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete?.(wallet.id)}
              disabled={isDeleting}
              aria-label={t("wallet.deleteButton")}
              title={t("wallet.deleteButton")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              {isDeleting ? (
                <IconLoader className="h-4 w-4 animate-spin" />
              ) : (
                <HiOutlineTrash className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      <FormField label={t("wallet.nameLabel")} htmlFor="wallet-name">
        <Input
          id="wallet-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("wallet.namePlaceholder")}
          required
        />
      </FormField>

      {!wallet && (
        <FormField label={t("wallet.balanceLabel")} htmlFor="wallet-balance">
          <Input
            id="wallet-balance"
            type="text"
            inputMode="decimal"
            value={balanceInput}
            onChange={(event) => setBalanceInput(formatNumberInput(event.target.value))}
            placeholder="0"
            startIcon={
              <Words type="sm/bold" as="span" className="text-ink-400 dark:text-ink-500">
                {currencySymbol}
              </Words>
            }
          />
        </FormField>
      )}

      <div className="flex flex-col gap-2">
        <Words type="sm/bold" className="text-ink-700 dark:text-ink-300">
          {t("wallet.colorLabel")}
        </Words>
        <WalletColorPicker value={color} onChange={setColor} />
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
