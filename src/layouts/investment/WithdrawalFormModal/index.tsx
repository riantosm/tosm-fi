import { useEffect, useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Checkbox } from "@/components/atoms/Checkbox";
import { FormField } from "@/components/molecules/FormField";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { useCategories } from "@/hooks/use-categories";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import { CURRENCIES } from "@/constants/currencies";
import { cn } from "@/utils/cn";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";
import type { Category } from "@/types/category.types";

interface WithdrawalFormModalProps {
  isOpen: boolean;
  instrument: Instrument;
  account: InvestmentAccount;
  onClose: () => void;
}

export function WithdrawalFormModal({
  isOpen,
  instrument,
  account,
  onClose,
}: WithdrawalFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {isOpen && (
        <WithdrawalFormFields instrument={instrument} account={account} onClose={onClose} />
      )}
    </Modal>
  );
}

function WithdrawalFormFields({
  instrument,
  account,
  onClose,
}: {
  instrument: Instrument;
  account: InvestmentAccount;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const currencySymbol = CURRENCIES.find((option) => option.code === currency)?.symbol ?? "IDR";
  const { createMoneyOut } = useInvestmentTransactions();
  const { createTransaction } = useTransactions();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { showToast } = useToast();

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

  function handleCategorySelect(selected: Category) {
    setCategoryId(selected.idCategory);
    setSubCategoryId(null);
    setIsCategoryPickerOpen(false);
    setIsSubCategoryPickerOpen(true);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = parseFormattedNumber(amountInput);
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
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
              {t("investment.withdrawalTitle")}
            </Words>
            <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
              {instrument.nameInstrument} — {account.nameInvestmentAccount} ·{" "}
              {t("investment.currentValue")}: {format(account.currentValue)}
            </Words>
          </div>
          <ModalCloseButton onClose={onClose} />
        </div>

        <FormField label={t("investment.investedAmountLabel")} htmlFor="withdrawal-amount">
          <Input
            id="withdrawal-amount"
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => setAmountInput(formatNumberInput(event.target.value))}
            placeholder="0"
            startIcon={
              <Words type="sm/bold" as="span" className="text-ink-400 dark:text-ink-500">
                {currencySymbol}
              </Words>
            }
          />
        </FormField>

        <FormField label={t("investment.noteLabel")} htmlFor="withdrawal-note">
          <Input
            id="withdrawal-note"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("investment.notePlaceholder")}
          />
        </FormField>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={depositToWallet}
            onChange={(event) => setDepositToWallet(event.target.checked)}
          />
          <Words type="sm/bold" as="span" className="text-ink-700 dark:text-ink-300">
            {t("investment.depositToWalletLabel")}
          </Words>
        </label>

        {depositToWallet && (
          <>
            <div className="flex flex-col gap-2">
              <Words
                type="xs/bold"
                className="uppercase tracking-wide text-ink-400 dark:text-ink-500"
              >
                {t("transaction.walletLabel")}
              </Words>
              <div className="flex flex-wrap gap-2">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.idWallet}
                    type="button"
                    onClick={() => setWalletId(wallet.idWallet)}
                    className={cn(
                      "rounded-full border-2 px-3 py-1.5 transition-colors",
                      selectedWalletId === wallet.idWallet ? "" : "border-ink-200 dark:border-ink-700",
                    )}
                    style={selectedWalletId === wallet.idWallet ? { borderColor: wallet.color } : undefined}
                  >
                    <Words type="xs/bold" as="span" className="text-ink-700 dark:text-ink-300">
                      {wallet.nameWallet}
                    </Words>
                  </button>
                ))}
              </div>
            </div>

            <FormField label={t("transaction.selectCategoryPlaceholder")} htmlFor="withdrawal-category">
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(true)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:hover:bg-ink-800"
              >
                <Words
                  type="sm/regular"
                  className={category ? "text-ink-900 dark:text-ink-50" : "text-ink-400 dark:text-ink-500"}
                >
                  {category
                    ? subCategory
                      ? `${category.nameCategory} — ${subCategory.nameSubCategory}`
                      : category.nameCategory
                    : t("transaction.selectCategoryPlaceholder")}
                </Words>
              </button>
            </FormField>
          </>
        )}

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

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type="income"
        onClose={() => setIsCategoryPickerOpen(false)}
        onSelect={handleCategorySelect}
      />

      <SelectSubCategoryModal
        isOpen={isSubCategoryPickerOpen}
        category={category}
        onClose={() => setIsSubCategoryPickerOpen(false)}
        onSelect={(selected) => {
          setSubCategoryId(selected ? selected.idSubCategory : null);
          setIsSubCategoryPickerOpen(false);
        }}
      />
    </>
  );
}
