import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuBanknote, LuCheck, LuInfo, LuStar, LuTrash2, LuWallet } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { WalletTile } from "@/layouts/wallet/WalletTile";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useMoneyFormat } from "@/hooks/use-money-format";
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

const FORM_ID = "wallet-form";

export function WalletFormModal(props: WalletFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <WalletFormDialog key={session} {...props} />;
}

function WalletFormDialog({
  isOpen,
  wallet: walletProp,
  isSubmitting,
  isDeleting,
  isSettingPrimary,
  onClose,
  onSubmit,
  onDelete,
  onSetPrimary,
}: WalletFormModalProps) {
  const { t } = useTranslation();
  const { format } = useMoneyFormat();
  // Frozen for this dialog's lifetime so the exit animation keeps showing the same wallet.
  const [wallet] = useState(walletProp ?? null);
  const [name, setName] = useState(wallet?.nameWallet ?? "");
  const [color, setColor] = useState(wallet?.color ?? WALLET_COLOR_PRESETS[0]);
  const [balanceInput, setBalanceInput] = useState("");

  const previewBalance = wallet ? wallet.balance : parseFormattedNumber(balanceInput);
  const isBusy = Boolean(isSubmitting || isDeleting || isSettingPrimary);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    const balance = parseFormattedNumber(balanceInput);
    onSubmit({ nameWallet: name.trim(), color, ...(wallet ? {} : { balance }) });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={wallet ? t("wallet.editTitle") : t("wallet.addTitle")}
      subtitle={wallet ? t("wallet.transactionCount", { n: wallet.transactionCount }) : undefined}
      headerActions={
        wallet && (
          <>
            <IconButton
              label={wallet.isPrimary ? t("wallet.primary") : t("wallet.setPrimaryButton")}
              icon={<LuStar className={wallet.isPrimary ? "fill-current" : undefined} />}
              size="sm"
              className="text-investment-text"
              onClick={() => onSetPrimary?.(wallet.idWallet)}
              disabled={wallet.isPrimary || isBusy}
            />
            <IconButton
              label={t("wallet.deleteButton")}
              icon={<LuTrash2 />}
              size="sm"
              variant="danger"
              onClick={() => onDelete?.(wallet.idWallet)}
              disabled={isBusy}
            />
          </>
        )
      }
      footer={
        <ModalActions>
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
            {wallet ? t("transaction.saveChanges") : t("wallet.saveWallet")}
          </Button>
        </ModalActions>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <div
          className="flex items-center gap-3 rounded-[18px] p-3.5 transition-colors duration-300"
          style={{ backgroundColor: `${color}1F` }}
        >
          <WalletTile
            color={color}
            onTint
            className="size-11 rounded-[14px] transition-colors duration-300"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="truncate text-[14.5px] font-semibold text-text">
              {name.trim() || t("wallet.namePreview")}
            </span>
            <span className="truncate font-num text-[13px] text-text-2 tabular">
              {format(previewBalance)}
            </span>
          </span>
          <span className="shrink-0 text-[12px] text-text-3">{t("wallet.preview")}</span>
        </div>

        <FormField label={t("wallet.nameLabel")} htmlFor="wallet-name">
          <Input
            id="wallet-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("wallet.namePlaceholder")}
            startIcon={<LuWallet />}
            required
            autoFocus={!wallet}
          />
        </FormField>

        {wallet ? (
          <div className="flex items-start gap-2.5 rounded-control bg-surface-2 px-3.5 py-3 text-[12.5px] leading-[1.5] text-text-2">
            <LuInfo className="mt-0.5 size-4 shrink-0 text-text-3" />
            {t("wallet.balanceEditHint")}
          </div>
        ) : (
          <FormField
            label={t("wallet.balanceLabel")}
            htmlFor="wallet-balance"
            helper={t("wallet.balanceHelper")}
          >
            <Input
              id="wallet-balance"
              type="text"
              inputMode="decimal"
              value={balanceInput}
              onChange={(event) => setBalanceInput(formatNumberInput(event.target.value))}
              placeholder="0"
              startIcon={<LuBanknote />}
              className="font-num tabular"
            />
          </FormField>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-text-2">{t("wallet.colorLabel")}</span>
          <ColorPicker value={color} onChange={setColor} presets={WALLET_COLOR_PRESETS} />
        </div>
      </form>
    </Modal>
  );
}
