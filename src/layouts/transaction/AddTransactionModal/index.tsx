import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import {
  LuArrowUpDown,
  LuCalendarClock,
  LuCheck,
  LuCopy,
  LuTrash2,
  LuTrendingUp,
  LuType,
} from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { AmountCard } from "@/components/molecules/AmountCard";
import { CategoryPickerRow } from "@/components/molecules/CategoryPickerRow";
import { Chip } from "@/components/molecules/Chip";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { PickerField } from "@/components/molecules/PickerField";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { WalletChipGroup } from "@/components/molecules/WalletChipGroup";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { InvestmentAccountPickerButton } from "@/layouts/investment/InvestmentAccountPickerButton";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialogSession } from "@/hooks/use-dialog-session";
import type { Category, CategoryType, SubCategory } from "@/types/category.types";
import type { Transaction, TransactionInput } from "@/types/transaction.types";
import { formatDateTimeLabel } from "@/utils/tx-time";

type FormTransactionType = "income" | "expense" | "transfer";

interface AddTransactionModalProps {
  isOpen: boolean;
  transaction?: Transaction | null;
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const TYPE_ACTIVE_CLASS: Record<FormTransactionType, string> = {
  expense: "text-expense-text",
  income: "text-income-text",
  transfer: "text-primary-text",
};

function toFormType(type: Transaction["type"] | undefined): FormTransactionType {
  return type === "transfer" ? "transfer" : type === "income" ? "income" : "expense";
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Catat / edit transaksi dialog. A fresh dialog (and form state) is mounted on
 * every open, so closing never leaks state into the next entry and the exit
 * animation keeps showing what was there.
 */
export function AddTransactionModal({ isOpen, transaction, onClose }: AddTransactionModalProps) {
  const session = useDialogSession(isOpen);
  return (
    <AddTransactionDialog
      key={session}
      isOpen={isOpen}
      transaction={transaction ?? null}
      onClose={onClose}
    />
  );
}

function AddTransactionDialog({
  isOpen,
  transaction: transactionProp,
  onClose,
}: {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { createTransaction, editTransaction, deleteTransaction } = useTransactions();
  const { createMoneyIn } = useInvestmentTransactions();
  const { showToast } = useToast();
  const { confirm } = useConfirmDialog();

  // Frozen for this dialog's lifetime: the parent clears its own state while we animate out.
  const [transaction] = useState(transactionProp);

  const [type, setType] = useState<FormTransactionType>(() => toFormType(transaction?.type));
  const [categoryId, setCategoryId] = useState<string | null>(transaction?.idCategory ?? null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(
    transaction?.idSubCategory ?? null,
  );
  const [amount, setAmount] = useState(transaction?.amount ?? 0);
  const [walletId, setWalletId] = useState<string | null>(transaction?.idWallet ?? null);
  const [walletFromId, setWalletFromId] = useState<string | null>(
    transaction?.idWalletFrom ?? null,
  );
  const [walletToId, setWalletToId] = useState<string | null>(transaction?.idWalletTo ?? null);
  const [title, setTitle] = useState(transaction?.title ?? "");
  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [date, setDate] = useState(() => (transaction ? new Date(transaction.date) : new Date()));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [isInvestment, setIsInvestment] = useState(false);
  const [investmentInstrumentId, setInvestmentInstrumentId] = useState<string | null>(null);
  const [investmentAccountId, setInvestmentAccountId] = useState<string | null>(null);

  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isSubCategoryPickerOpen, setIsSubCategoryPickerOpen] = useState(false);
  const [isAmountPickerOpen, setIsAmountPickerOpen] = useState(false);
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);

  useEffect(() => {
    if (categoriesStatus === "idle") void loadCategories();
  }, [categoriesStatus, loadCategories]);

  useEffect(() => {
    if (walletsStatus === "idle") void loadWallets();
  }, [walletsStatus, loadWallets]);

  const selectedWalletId =
    walletId ?? (wallets.find((wallet) => wallet.isPrimary) ?? wallets[0])?.idWallet ?? null;

  const category = categoryId
    ? (categories.find((item) => item.idCategory === categoryId) ?? null)
    : null;
  const subCategory = subCategoryId
    ? (category?.subCategories.find((sub) => sub.idSubCategory === subCategoryId) ?? null)
    : null;

  const quickPicks = useMemo(() => {
    if (type === "transfer") return [];

    if (category) {
      return category.subCategories.map((sub) => ({ sub, category }));
    }

    const allSubCategories = categories
      .filter((item) => item.type === type)
      .flatMap((item) => item.subCategories.map((sub) => ({ sub, category: item })));

    return shuffle(allSubCategories).slice(0, 6);
  }, [categories, type, category]);

  function handleTypeChange(nextType: FormTransactionType) {
    if (nextType === type) return;
    setType(nextType);
    setCategoryId(null);
    setSubCategoryId(null);
    setWalletFromId(null);
    setWalletToId(null);
    setIsInvestment(false);
    setInvestmentInstrumentId(null);
    setInvestmentAccountId(null);
  }

  function handleCategorySelect(selected: Category) {
    setCategoryId(selected.idCategory);
    setSubCategoryId(null);
    setIsCategoryPickerOpen(false);
    setIsSubCategoryPickerOpen(true);
  }

  function handleQuickPick(pickedCategory: Category, pickedSub: SubCategory) {
    setCategoryId(pickedCategory.idCategory);
    setSubCategoryId(pickedSub.idSubCategory);
  }

  function buildInput(): TransactionInput | null {
    if (amount <= 0) {
      showToast(t("transaction.amountRequiredError"), "error");
      return null;
    }

    if (type === "transfer") {
      if (!walletFromId || !walletToId) {
        showToast(t("transaction.transferWalletRequiredError"), "error");
        return null;
      }
      if (walletFromId === walletToId) {
        showToast(t("transaction.transferSameWalletError"), "error");
        return null;
      }
      const fromWallet = wallets.find((item) => item.idWallet === walletFromId);
      const toWallet = wallets.find((item) => item.idWallet === walletToId);
      const defaultTitle =
        fromWallet && toWallet
          ? t("transaction.transferTitleTemplate", {
              from: fromWallet.nameWallet,
              to: toWallet.nameWallet,
            })
          : t("transaction.transfer");

      return {
        type: "transfer",
        idWallet: null,
        idCategory: null,
        idSubCategory: null,
        idWalletFrom: walletFromId,
        idWalletTo: walletToId,
        title: title.trim() || defaultTitle,
        notes: notes.trim(),
        amount,
        date: date.toISOString(),
      };
    }

    if (!category) {
      showToast(t("transaction.categoryRequiredError"), "error");
      return null;
    }
    if (!selectedWalletId) {
      showToast(t("transaction.walletRequiredError"), "error");
      return null;
    }
    if (
      type === "expense" &&
      !transaction &&
      isInvestment &&
      (!investmentInstrumentId || !investmentAccountId)
    ) {
      showToast(t("investment.selectAccountRequiredError"), "error");
      return null;
    }

    return {
      type,
      idWallet: selectedWalletId,
      idCategory: category.idCategory,
      idSubCategory: subCategory?.idSubCategory ?? null,
      idWalletFrom: null,
      idWalletTo: null,
      title: title.trim(),
      notes: notes.trim(),
      amount,
      date: date.toISOString(),
    };
  }

  async function handleSave() {
    const input = buildInput();
    if (!input) return;

    setIsSaving(true);
    try {
      if (transaction) {
        await editTransaction(transaction.idTransaction, input);
        showToast(t("transaction.updateSuccess"), "success");
      } else {
        const created = await createTransaction(input);
        showToast(t("transaction.createSuccess"), "success");

        if (type === "expense" && isInvestment && investmentInstrumentId && investmentAccountId) {
          try {
            await createMoneyIn({
              idInstrument: investmentInstrumentId,
              idInvestmentAccount: investmentAccountId,
              amount: input.amount,
              date: input.date,
              idTransaction: created.idTransaction,
            });
          } catch (investmentError) {
            showToast(
              investmentError instanceof Error
                ? investmentError.message
                : t("investment.moneyInFailedButTransactionSaved"),
              "error",
            );
          }
        }
      }
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("transaction.genericError"), "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDuplicate() {
    const input = buildInput();
    if (!input) return;

    setIsDuplicating(true);
    try {
      await createTransaction(input);
      showToast(t("transaction.duplicateSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("transaction.genericError"), "error");
    } finally {
      setIsDuplicating(false);
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    const confirmed = await confirm({
      title: t("transaction.deleteConfirmTitle"),
      description: t("transaction.deleteConfirmDescription"),
      confirmLabel: t("transaction.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.idTransaction);
      showToast(t("transaction.deleteSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("transaction.genericError"), "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const isBusy = isSaving || isDuplicating || isDeleting;
  const isTransfer = type === "transfer";
  const fromWallet = wallets.find((item) => item.idWallet === walletFromId);
  const toWallet = wallets.find((item) => item.idWallet === walletToId);
  const saveLabel = transaction
    ? t("transaction.saveChanges")
    : isTransfer
      ? t("transaction.saveTransfer")
      : t("transaction.save");

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={transaction ? t("transaction.editTransaction") : t("transaction.addTransaction")}
        subtitle={
          transaction
            ? t("transaction.recordedAt", {
                date: formatDateTimeLabel(new Date(transaction.date), language),
              })
            : undefined
        }
        headerActions={
          transaction && (
            <>
              <IconButton
                label={t("transaction.duplicateButton")}
                icon={<LuCopy />}
                size="sm"
                onClick={() => void handleDuplicate()}
                disabled={isBusy}
              />
              <IconButton
                label={t("transaction.deleteButton")}
                icon={<LuTrash2 />}
                size="sm"
                variant="danger"
                onClick={() => void handleDelete()}
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
              type="button"
              leftIcon={<LuCheck />}
              onClick={() => void handleSave()}
              isLoading={isSaving}
              disabled={isBusy}
            >
              {saveLabel}
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-[18px]">
          <SegmentedControl
            options={[
              { value: "expense", label: t("transaction.expense") },
              { value: "income", label: t("transaction.income") },
              { value: "transfer", label: t("transaction.transfer") },
            ]}
            value={type}
            onChange={handleTypeChange}
            size="md"
            fill
            activeClassName={TYPE_ACTIVE_CLASS[type]}
            ariaLabel={t("transaction.typeLabel")}
          />

          <AmountCard
            amount={amount}
            onPickAmount={() => setIsAmountPickerOpen(true)}
            pickAmountLabel={t("transaction.amountTitle")}
            header={
              !isTransfer && (
                <CategoryPickerRow
                  category={category}
                  subCategory={subCategory}
                  placeholder={t("transaction.selectCategoryPlaceholder")}
                  onClick={() => setIsCategoryPickerOpen(true)}
                />
              )
            }
          />

          <AnimatePresence initial={false} mode="popLayout">
            {isTransfer ? (
              <m.div
                key="transfer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex flex-col gap-3 rounded-[18px] border border-border p-4"
              >
                <WalletChipGroup
                  label={t("transaction.transferFrom")}
                  wallets={wallets}
                  selectedId={walletFromId}
                  disabledId={walletToId}
                  onSelect={setWalletFromId}
                />
                <div className="flex items-center gap-3" aria-hidden={false}>
                  <span className="h-px flex-1 bg-border" />
                  <IconButton
                    label={t("transaction.swapWallets")}
                    icon={<LuArrowUpDown />}
                    size="sm"
                    className="bg-primary-soft text-primary-text hover:bg-primary-soft"
                    onClick={() => {
                      setWalletFromId(walletToId);
                      setWalletToId(walletFromId);
                    }}
                  />
                  <span className="h-px flex-1 bg-border" />
                </div>
                <WalletChipGroup
                  label={t("transaction.transferTo")}
                  wallets={wallets}
                  selectedId={walletToId}
                  disabledId={walletFromId}
                  onSelect={setWalletToId}
                />
              </m.div>
            ) : (
              quickPicks.length > 0 && (
                <m.div
                  key={`quick-${type}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="flex flex-col gap-2"
                >
                  <span className="text-[13px] font-semibold text-text-2">
                    {t("transaction.quickSubLabel")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickPicks.map(({ sub, category: parent }) => (
                      <Chip
                        key={sub.idSubCategory}
                        size="sm"
                        active={sub.idSubCategory === subCategoryId}
                        onClick={() => handleQuickPick(parent, sub)}
                        className="max-w-[220px]"
                      >
                        {sub.nameSubCategory}
                        {!category && (
                          <span className="ml-1 font-normal text-text-3">
                            · {parent.nameCategory}
                          </span>
                        )}
                      </Chip>
                    ))}
                  </div>
                </m.div>
              )
            )}
          </AnimatePresence>

          <FormField
            label={isTransfer ? t("transaction.titleLabel") : t("transaction.titleLabelOptional")}
            htmlFor="tx-title"
          >
            <Input
              id="tx-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                isTransfer && fromWallet && toWallet
                  ? `${fromWallet.nameWallet} → ${toWallet.nameWallet}`
                  : t("transaction.titlePlaceholder")
              }
              startIcon={<LuType />}
            />
          </FormField>

          <FormField label={t("transaction.notesLabel")} htmlFor="tx-notes">
            <Textarea
              id="tx-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("transaction.notesPlaceholder")}
              rows={2}
            />
          </FormField>

          <PickerField
            id="tx-date"
            label={t("transaction.dateTimeLabel")}
            icon={<LuCalendarClock />}
            value={formatDateTimeLabel(date, language, {
              today: t("transaction.today"),
              yesterday: t("transaction.yesterday"),
            })}
            onClick={() => setIsDateTimePickerOpen(true)}
          />

          {!isTransfer && (
            <WalletChipGroup
              label={t("transaction.walletLabel")}
              wallets={wallets}
              selectedId={selectedWalletId}
              onSelect={setWalletId}
            />
          )}

          {type === "expense" && !transaction && (
            <div className="flex flex-col gap-2.5">
              <label className="flex cursor-pointer items-center gap-3 rounded-control border border-border px-3.5 py-3 transition-colors duration-200 hover:bg-surface-2 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                <Checkbox
                  checked={isInvestment}
                  onChange={(event) => setIsInvestment(event.target.checked)}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-px">
                  <span className="truncate text-[14px] font-semibold text-text">
                    {t("transaction.markAsInvestment")}
                  </span>
                  <span className="truncate text-[12.5px] text-text-3">
                    {t("transaction.markAsInvestmentHint")}
                  </span>
                </span>
                <LuTrendingUp className="size-[18px] shrink-0 text-investment-text" />
              </label>

              <AnimatePresence initial={false}>
                {isInvestment && (
                  <m.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <InvestmentAccountPickerButton
                      idInstrument={investmentInstrumentId}
                      idInvestmentAccount={investmentAccountId}
                      onChange={(instrument, account) => {
                        setInvestmentInstrumentId(instrument.idInstrument);
                        setInvestmentAccountId(account.idInvestmentAccount);
                      }}
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Modal>

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type={type === "transfer" ? "expense" : (type as CategoryType)}
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

      <AmountCalculatorModal
        isOpen={isAmountPickerOpen}
        amount={amount}
        wallets={type === "transfer" ? [] : wallets}
        selectedWalletId={type === "transfer" ? null : selectedWalletId}
        onSelectWallet={type === "transfer" ? () => {} : setWalletId}
        onClose={() => setIsAmountPickerOpen(false)}
        onConfirm={setAmount}
      />

      <DateTimePickerModal
        isOpen={isDateTimePickerOpen}
        value={date}
        onClose={() => setIsDateTimePickerOpen(false)}
        onConfirm={setDate}
      />
    </>
  );
}
