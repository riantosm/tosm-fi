import { useEffect, useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuArrowUpRight, LuNotebookPen } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { CategoryPickerRow } from "@/components/molecules/CategoryPickerRow";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { WalletChipGroup } from "@/components/molecules/WalletChipGroup";
import { AmountInput } from "@/layouts/investment/AmountInput";
import { InvestmentAccountSummary } from "@/layouts/investment/InvestmentAccountSummary";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { useCategories } from "@/hooks/use-categories";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { parseFormattedNumber } from "@/utils/number-input";
import type { Category } from "@/types/category.types";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

interface WithdrawalFormModalProps {
  isOpen: boolean;
  instrument: Instrument | null;
  account: InvestmentAccount | null;
  onClose: () => void;
}

const FORM_ID = "withdrawal-form";
const EASE = [0.22, 1, 0.36, 1] as const;

export function WithdrawalFormModal(props: WithdrawalFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <WithdrawalFormDialog key={session} {...props} />;
}

function WithdrawalFormDialog({
  isOpen,
  instrument: instrumentProp,
  account: accountProp,
  onClose,
}: WithdrawalFormModalProps) {
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const { createMoneyOut } = useInvestmentTransactions();
  const { createTransaction } = useTransactions();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { showToast } = useToast();

  // Frozen for this dialog's lifetime so the exit animation keeps the same account.
  const [instrument] = useState(instrumentProp);
  const [account] = useState(accountProp);
  const [amountInput, setAmountInput] = useState("");
  const [note, setNote] = useState("");
  const [depositToWallet, setDepositToWallet] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isSubCategoryPickerOpen, setIsSubCategoryPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  const selectedWalletId =
    walletId ?? (wallets.find((wallet) => wallet.isPrimary) ?? wallets[0])?.idWallet ?? null;
  const category = categoryId
    ? (categories.find((item) => item.idCategory === categoryId) ?? null)
    : null;
  const subCategory = subCategoryId
    ? (category?.subCategories.find((sub) => sub.idSubCategory === subCategoryId) ?? null)
    : null;

  const amount = parseFormattedNumber(amountInput);
  const remaining = (account?.currentValue ?? 0) - amount;
  const isOverdrawn = amount > 0 && remaining < 0;

  function handleCategorySelect(selected: Category) {
    setCategoryId(selected.idCategory);
    setSubCategoryId(null);
    setIsCategoryPickerOpen(false);
    setIsSubCategoryPickerOpen(true);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!instrument || !account) return;
    if (amount <= 0) {
      showToast(t("transaction.amountRequiredError"), "error");
      return;
    }
    if (depositToWallet && (!selectedWalletId || !category)) {
      showToast(t("investment.depositToWalletRequiredError"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      let idTransaction: string | null = null;
      if (depositToWallet && selectedWalletId && category) {
        const created = await createTransaction({
          type: "income",
          idWallet: selectedWalletId,
          idCategory: category.idCategory,
          idSubCategory: subCategory?.idSubCategory ?? null,
          idWalletFrom: null,
          idWalletTo: null,
          title: t("investment.withdrawalTransactionTitle"),
          notes: note,
          amount,
          date: new Date().toISOString(),
        });
        idTransaction = created.idTransaction;
      }
      await createMoneyOut({
        idInstrument: instrument.idInstrument,
        idInvestmentAccount: account.idInvestmentAccount,
        amount,
        date: new Date().toISOString(),
        idTransaction,
        note: note || undefined,
      });
      showToast(t("investment.withdrawalSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title={t("investment.withdrawalTitle")}
        subtitle={t("investment.withdrawalSubtitle")}
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              leftIcon={<LuArrowUpRight />}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {t("investment.withdrawalTitle")}
            </Button>
          </ModalActions>
        }
      >
        <form
          id={FORM_ID}
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-[18px]"
        >
          {account && instrument && (
            <InvestmentAccountSummary
              title={account.nameInvestmentAccount}
              subtitle={instrument.nameInstrument}
              valueLabel={t("investment.valueShort")}
              value={formatNumber(account.currentValue)}
            />
          )}

          <FormField
            label={t("investment.withdrawAmountLabel")}
            htmlFor="withdrawal-amount"
            helper={
              amount > 0 && (
                <span className={isOverdrawn ? "text-expense-text" : undefined}>
                  {isOverdrawn
                    ? t("investment.withdrawOverValue")
                    : t("investment.remainingAfterWithdraw", { amount: formatNumber(remaining) })}
                </span>
              )
            }
          >
            <AmountInput
              id="withdrawal-amount"
              value={amountInput}
              onChange={setAmountInput}
              autoFocus
              hasError={isOverdrawn}
            />
          </FormField>

          <FormField label={t("investment.noteLabel")} htmlFor="withdrawal-note">
            <Input
              id="withdrawal-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("investment.notePlaceholder")}
              startIcon={<LuNotebookPen />}
            />
          </FormField>

          <div className="flex flex-col">
            <label className="flex cursor-pointer items-center gap-3 rounded-control bg-surface-2 px-3.5 py-3">
              <Checkbox
                checked={depositToWallet}
                onChange={(event) => setDepositToWallet(event.target.checked)}
              />
              <span className="flex min-w-0 flex-col gap-px">
                <span className="text-[14px] font-semibold text-text">
                  {t("investment.depositToWalletLabel")}
                </span>
                <span className="text-[12.5px] text-text-2">
                  {t("investment.depositToWalletHint")}
                </span>
              </span>
            </label>

            <AnimatePresence initial={false}>
              {depositToWallet && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3.5 px-1 pt-3.5">
                    <WalletChipGroup
                      label={t("investment.destinationWallet")}
                      wallets={wallets}
                      selectedId={selectedWalletId}
                      onSelect={setWalletId}
                      size="sm"
                    />
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-semibold text-text-2">
                        {t("investment.incomeCategory")}
                      </span>
                      <div className="flex flex-col rounded-control bg-surface-2 px-3.5 py-2.5">
                        <CategoryPickerRow
                          category={category}
                          subCategory={subCategory}
                          placeholder={t("transaction.selectCategoryPlaceholder")}
                          onClick={() => setIsCategoryPickerOpen(true)}
                        />
                      </div>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </Modal>

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type="income"
        selectedId={categoryId}
        onClose={() => setIsCategoryPickerOpen(false)}
        onSelect={handleCategorySelect}
      />

      <SelectSubCategoryModal
        isOpen={isSubCategoryPickerOpen}
        category={category}
        selectedId={subCategoryId}
        onBack={() => {
          setIsSubCategoryPickerOpen(false);
          setIsCategoryPickerOpen(true);
        }}
        onClose={() => setIsSubCategoryPickerOpen(false)}
        onSelect={(selected) => {
          setSubCategoryId(selected ? selected.idSubCategory : null);
          setIsSubCategoryPickerOpen(false);
        }}
      />
    </>
  );
}
