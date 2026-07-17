import { createElement, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowsRightLeft,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineDocumentDuplicate,
  HiOutlineTag,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Words } from "@/components/atoms/Words";
import { Tooltip } from "@/components/atoms/Tooltip";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { InvestmentAccountPickerButton } from "@/layouts/investment/InvestmentAccountPickerButton";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category, CategoryType, SubCategory } from "@/types/category.types";
import type { Transaction, TransactionInput } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

type FormTransactionType = "income" | "expense" | "transfer";

interface AddTransactionModalProps {
  isOpen: boolean;
  transaction?: Transaction | null;
  onClose: () => void;
}

function toFormType(type: Transaction["type"] | undefined): FormTransactionType {
  return type === "transfer" ? "transfer" : type === "income" ? "income" : "expense";
}

function formatDateLabel(date: Date, locale: string, todayLabel: string): string {
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return todayLabel;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

function formatTimeLabel(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function AddTransactionModal({ isOpen, transaction, onClose }: AddTransactionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      {isOpen && <AddTransactionFields transaction={transaction ?? null} onClose={onClose} />}
    </Modal>
  );
}

function AddTransactionFields({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { createTransaction, editTransaction, deleteTransaction } = useTransactions();
  const { createMoneyIn } = useInvestmentTransactions();
  const { format } = useCurrency();
  const { showToast } = useToast();
  const { confirm } = useConfirmDialog();

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
    return categories
      .filter((item) => item.type === type)
      .flatMap((item) => item.subCategories.map((sub) => ({ sub, category: item })))
      .sort((a, b) => b.sub.transactionCount - a.sub.transactionCount)
      .slice(0, 6);
  }, [categories, type]);

  const CategoryIcon = category ? resolveCategoryIcon(category.icon) : HiOutlineTag;

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

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <Words as="h2" type="xl/bold" className="text-ink-900 dark:text-ink-50">
            {transaction ? t("transaction.editTransaction") : t("transaction.addTransaction")}
          </Words>
          <div className="flex shrink-0 items-center gap-1">
            {transaction && (
              <>
                <Tooltip content={t("transaction.duplicateButton")}>
                  <button
                    type="button"
                    onClick={() => void handleDuplicate()}
                    disabled={isDuplicating}
                    aria-label={t("transaction.duplicateButton")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 disabled:opacity-60 dark:hover:bg-ink-800 dark:hover:text-ink-200"
                  >
                    <HiOutlineDocumentDuplicate className="h-4 w-4" />
                  </button>
                </Tooltip>
                <Tooltip content={t("transaction.deleteButton")}>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={isDeleting}
                    aria-label={t("transaction.deleteButton")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </Tooltip>
              </>
            )}
            <ModalCloseButton onClose={onClose} />
          </div>
        </div>

        <div className="flex rounded-xl border border-ink-200 p-1 dark:border-ink-800">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={cn(
              "flex-1 rounded-lg py-2 text-center transition-colors",
              type === "expense"
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
            )}
          >
            <Words type="sm/bold" as="span">
              {t("transaction.expense")}
            </Words>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={cn(
              "flex-1 rounded-lg py-2 text-center transition-colors",
              type === "income"
                ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
            )}
          >
            <Words type="sm/bold" as="span">
              {t("transaction.income")}
            </Words>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("transfer")}
            className={cn(
              "flex-1 rounded-lg py-2 text-center transition-colors",
              type === "transfer"
                ? "bg-ink-200 text-ink-800 dark:bg-ink-700 dark:text-ink-100"
                : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
            )}
          >
            <Words type="sm/bold" as="span">
              {t("transaction.transfer")}
            </Words>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-2xl p-4",
                (type === "transfer" || !category) && "bg-ink-100 dark:bg-ink-800",
              )}
              style={type !== "transfer" && category ? { backgroundColor: `${category.color}26` } : undefined}
            >
              {type === "transfer" ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-200 dark:bg-ink-700">
                    <HiOutlineArrowsRightLeft className="h-6 w-6 text-ink-500 dark:text-ink-400" />
                  </div>
                  <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                    {t("transaction.transfer")}
                  </Words>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCategoryPickerOpen(true)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                    style={category ? { backgroundColor: `${category.color}40` } : undefined}
                  >
                    {createElement(CategoryIcon, {
                      className: "h-6 w-6",
                      style: { color: category?.color },
                    })}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
                      {category
                        ? category.nameCategory
                        : t("transaction.selectCategoryPlaceholder")}
                    </Words>
                    {subCategory && (
                      <Words type="xs/regular" className="truncate text-ink-500 dark:text-ink-400">
                        {subCategory.nameSubCategory}
                      </Words>
                    )}
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsAmountPickerOpen(true)}
                className="ml-auto min-w-0 shrink-0"
              >
                <Words
                  type={format(amount).length > 12 ? "sm/bold" : "xl/bold"}
                  className="break-words text-right text-ink-900 dark:text-ink-50"
                >
                  {format(amount)}
                </Words>
              </button>
            </div>

            {quickPicks.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {quickPicks.map(({ sub, category: parent }) => (
                  <button
                    key={sub.idSubCategory}
                    type="button"
                    onClick={() => handleQuickPick(parent, sub)}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-ink-200 px-3 py-1.5 text-ink-600 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                  >
                    <Words type="xs/regular" as="span">
                      {sub.nameSubCategory}
                    </Words>
                    <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                      《{parent.nameCategory}》
                    </Words>
                  </button>
                ))}
              </div>
            )}

            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("transaction.titlePlaceholder")}
            />

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("transaction.notesPlaceholder")}
              rows={3}
              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-colors focus:border-primary-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-primary-500"
            />
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsDateTimePickerOpen(true)}
              className="flex items-center gap-3 rounded-2xl border border-ink-200 p-3 transition-colors hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800">
                <HiOutlineCalendarDays className="h-4 w-4 text-ink-500 dark:text-ink-400" />
              </div>
              <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                {formatDateLabel(date, language, t("transaction.today"))}
              </Words>
              <span className="flex-1" />
              <HiOutlineClock className="h-4 w-4 shrink-0 text-ink-400 dark:text-ink-500" />
              <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                {formatTimeLabel(date, language)}
              </Words>
            </button>

            {type === "transfer" ? (
              <>
                <WalletPickerGroup
                  label={t("transaction.transferFrom")}
                  wallets={wallets}
                  selectedId={walletFromId}
                  disabledId={walletToId}
                  onSelect={setWalletFromId}
                />
                <WalletPickerGroup
                  label={t("transaction.transferTo")}
                  wallets={wallets}
                  selectedId={walletToId}
                  disabledId={walletFromId}
                  onSelect={setWalletToId}
                />
              </>
            ) : (
              <WalletPickerGroup
                label={t("transaction.walletLabel")}
                wallets={wallets}
                selectedId={selectedWalletId}
                onSelect={setWalletId}
              />
            )}

            {type === "expense" && !transaction && (
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={isInvestment}
                    onChange={(event) => setIsInvestment(event.target.checked)}
                  />
                  <Words type="sm/bold" as="span" className="text-ink-700 dark:text-ink-300">
                    {t("transaction.markAsInvestment")}
                  </Words>
                </label>

                {isInvestment && (
                  <InvestmentAccountPickerButton
                    idInstrument={investmentInstrumentId}
                    idInvestmentAccount={investmentAccountId}
                    onChange={(instrument, account) => {
                      setInvestmentInstrumentId(instrument.idInstrument);
                      setInvestmentAccountId(account.idInvestmentAccount);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <Button onClick={() => void handleSave()} isLoading={isSaving} className="w-full">
          <Words type="sm/bold" as="span">
            {t("transaction.save")}
          </Words>
        </Button>
      </div>

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type={type === "transfer" ? "expense" : (type as CategoryType)}
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

interface WalletPickerGroupProps {
  label: string;
  wallets: WalletAccount[];
  selectedId: string | null;
  disabledId?: string | null;
  onSelect: (id: string) => void;
}

function WalletPickerGroup({
  label,
  wallets,
  selectedId,
  disabledId,
  onSelect,
}: WalletPickerGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <Words type="xs/bold" className="uppercase tracking-wide text-ink-400 dark:text-ink-500">
        {label}
      </Words>
      <div className="flex flex-wrap gap-2">
        {wallets.map((wallet) => (
          <button
            key={wallet.idWallet}
            type="button"
            onClick={() => onSelect(wallet.idWallet)}
            disabled={wallet.idWallet === disabledId}
            className={cn(
              "rounded-full border-2 px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              selectedId === wallet.idWallet ? "" : "border-ink-200 dark:border-ink-700",
            )}
            style={selectedId === wallet.idWallet ? { borderColor: wallet.color } : undefined}
          >
            <Words
              type="xs/bold"
              as="span"
              className="text-ink-700 dark:text-ink-300 flex shrink-0 items-center justify-center"
            >
              {wallet.nameWallet}
            </Words>
          </button>
        ))}
      </div>
    </div>
  );
}
