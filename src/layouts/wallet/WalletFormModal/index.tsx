import { useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  LuBanknote,
  LuCheck,
  LuChevronRight,
  LuInfo,
  LuPencil,
  LuStar,
  LuTrash2,
  LuWallet,
} from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { ColorPicker } from "@/components/molecules/ColorPicker";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { WalletTile } from "@/components/atoms/WalletTile";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { cn } from "@/utils/cn";
import { IMAGE_UPLOAD_ACCEPT, resizeImageFile } from "@/utils/image";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import type { WalletAccount, WalletInput, WalletLogoChange } from "@/types/wallet.types";

interface WalletFormModalProps {
  isOpen: boolean;
  wallet?: WalletAccount | null;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  onClose: () => void;
  /** `logoChange` is undefined when the logo was left as it was. */
  onSubmit: (input: WalletInput, logoChange?: WalletLogoChange) => void;
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  /** Editing only: the balance hint becomes a button that opens Koreksi saldo (as on mobile). */
  onCorrectBalance?: (wallet: WalletAccount) => void;
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
  onCorrectBalance,
}: WalletFormModalProps) {
  const { t } = useTranslation();
  const { format } = useMoneyFormat();
  // Frozen for this dialog's lifetime so the exit animation keeps showing the same wallet.
  const [wallet] = useState(walletProp ?? null);
  const [name, setName] = useState(wallet?.nameWallet ?? "");
  const [color, setColor] = useState(wallet?.color ?? WALLET_COLOR_PRESETS[0]);
  const [balanceInput, setBalanceInput] = useState("");
  // The logo shown in the form plus the change to apply on save (none = keep the current one).
  const [logo, setLogo] = useState<{ previewUrl: string | null; change?: WalletLogoChange }>({
    previewUrl: wallet?.logoUrl ?? null,
  });
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const previewBalance = wallet ? wallet.balance : parseFormattedNumber(balanceInput);
  const isBusy = Boolean(isSubmitting || isDeleting || isSettingPrimary);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || isProcessingLogo) return;
    const balance = parseFormattedNumber(balanceInput);
    onSubmit({ nameWallet: name.trim(), color, ...(wallet ? {} : { balance }) }, logo.change);
  }

  async function handleLogoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;
    setLogoError(null);
    setIsProcessingLogo(true);
    try {
      const { image, previewUrl } = await resizeImageFile(file);
      setLogo({ previewUrl, change: { type: "upload", image } });
    } catch (error) {
      setLogoError(
        error instanceof Error && error.message === "tooLarge"
          ? t("wallet.logoTooLarge")
          : t("wallet.logoInvalid"),
      );
    } finally {
      setIsProcessingLogo(false);
    }
  }

  function handleRemoveLogo() {
    setLogoError(null);
    // A logo picked in this dialog but not saved yet just goes back to "no change".
    setLogo(
      wallet?.logoUrl ? { previewUrl: null, change: { type: "remove" } } : { previewUrl: null },
    );
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
            disabled={isBusy || isProcessingLogo || !name.trim()}
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
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={isBusy || isProcessingLogo}
            aria-label={logo.previewUrl ? t("wallet.logoChange") : t("wallet.logoUpload")}
            title={t("wallet.logoHelper")}
            className={cn(
              "group relative shrink-0 rounded-[14px] transition-transform duration-200 hover:scale-105 disabled:hover:scale-100",
              isProcessingLogo && "animate-pulse",
            )}
          >
            <WalletTile
              color={color}
              logoUrl={logo.previewUrl}
              onTint
              className="size-11 rounded-[14px] transition-colors duration-300"
            />
            <span className="absolute -right-1 -bottom-1 flex size-[18px] items-center justify-center rounded-full bg-surface text-text-2 shadow-card transition-colors group-hover:text-text">
              <LuPencil className="size-2.5" />
            </span>
          </button>
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
        <input
          ref={logoInputRef}
          type="file"
          accept={IMAGE_UPLOAD_ACCEPT}
          onChange={handleLogoFile}
          className="hidden"
        />
        {(logoError || logo.previewUrl) && (
          <div className="-mt-2.5 flex items-start justify-between gap-3">
            <p className="animate-fade-in text-[12px] font-medium text-expense-text">{logoError}</p>
            {logo.previewUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={isBusy || isProcessingLogo}
                className="shrink-0 text-[12px] font-medium text-text-3 transition-colors hover:text-expense-text disabled:opacity-60"
              >
                {t("wallet.logoRemove")}
              </button>
            )}
          </div>
        )}

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

        {wallet && onCorrectBalance ? (
          <button
            type="button"
            onClick={() => onCorrectBalance(wallet)}
            disabled={isBusy}
            className="group flex items-center gap-2.5 rounded-control bg-surface-2 px-3.5 py-3 text-left text-[12.5px] leading-[1.5] text-text-2 transition-colors duration-200 hover:bg-surface-3 disabled:opacity-60"
          >
            <LuInfo className="size-4 shrink-0 text-text-3" />
            <span className="flex-1">{t("wallet.balanceEditHint")}</span>
            <LuChevronRight className="size-4 shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        ) : wallet ? (
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
