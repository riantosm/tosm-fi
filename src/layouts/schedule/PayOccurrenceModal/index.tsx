import { createElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineTag } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useScheduleOccurrences } from "@/hooks/use-schedule-occurrences";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category } from "@/types/category.types";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface PayOccurrenceModalProps {
  isOpen: boolean;
  occurrence: ScheduleOccurrence | null;
  onClose: () => void;
}

function formatDateLabel(date: Date, locale: string, todayLabel: string): string {
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return todayLabel;
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
      date,
    );
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

export function PayOccurrenceModal({ isOpen, occurrence, onClose }: PayOccurrenceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      {isOpen && occurrence && <PayOccurrenceFields occurrence={occurrence} onClose={onClose} />}
    </Modal>
  );
}

function PayOccurrenceFields({
  occurrence,
  onClose,
}: {
  occurrence: ScheduleOccurrence;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { payOccurrence } = useScheduleOccurrences();
  const { format } = useCurrency();
  const { showToast } = useToast();

  const [categoryId, setCategoryId] = useState<string | null>(occurrence.idCategory);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(occurrence.idSubCategory);
  const [amount, setAmount] = useState(occurrence.amount);
  const [walletId, setWalletId] = useState<string>(occurrence.idWallet);
  const [date, setDate] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);

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

  const category = categoryId ? (categories.find((item) => item.idCategory === categoryId) ?? null) : null;
  const subCategory = subCategoryId
    ? (category?.subCategories.find((sub) => sub.idSubCategory === subCategoryId) ?? null)
    : null;

  const CategoryIcon = category ? resolveCategoryIcon(category.icon) : HiOutlineTag;

  function handleCategorySelect(selected: Category) {
    setCategoryId(selected.idCategory);
    setSubCategoryId(null);
    setIsCategoryPickerOpen(false);
    setIsSubCategoryPickerOpen(true);
  }

  async function handleConfirm() {
    if (amount <= 0) {
      showToast(t("schedule.amountRequiredError"), "error");
      return;
    }
    if (!category) {
      showToast(t("schedule.categoryRequiredError"), "error");
      return;
    }
    if (!walletId) {
      showToast(t("schedule.walletRequiredError"), "error");
      return;
    }

    setIsSaving(true);
    try {
      await payOccurrence(occurrence.idOccurrence, {
        amount,
        date: date.toISOString(),
        idWallet: walletId,
        idCategory: category.idCategory,
        idSubCategory: subCategory?.idSubCategory ?? null,
      });
      showToast(t("schedule.paySuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("schedule.genericError"), "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <Words as="h2" type="xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("schedule.payConfirmTitle")}
          </Words>
          <ModalCloseButton onClose={onClose} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-2xl p-4",
                !category && "bg-ink-100 dark:bg-ink-800",
              )}
              style={category ? { backgroundColor: `${category.color}26` } : undefined}
            >
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
                    className: cn("h-6 w-6", !category && "text-ink-400 dark:text-ink-500"),
                    style: category ? { color: category.color } : undefined,
                  })}
                </div>
                <div className="flex min-w-0 flex-col">
                  <Words type="sm/bold" className="truncate text-ink-900 dark:text-ink-50">
                    {category ? category.nameCategory : t("transaction.selectCategoryPlaceholder")}
                  </Words>
                  {subCategory && (
                    <Words type="xs/regular" className="truncate text-ink-500 dark:text-ink-400">
                      {subCategory.nameSubCategory}
                    </Words>
                  )}
                </div>
              </button>

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

            <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
              {occurrence.title}
            </Words>
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

            <WalletPickerGroup
              label={t("transaction.walletLabel")}
              wallets={wallets}
              selectedId={walletId}
              onSelect={setWalletId}
            />
          </div>
        </div>

        <Button onClick={() => void handleConfirm()} isLoading={isSaving} className="w-full">
          <Words type="sm/bold" as="span">
            {t("schedule.payButton")}
          </Words>
        </Button>
      </div>

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type={occurrence.type}
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
        wallets={wallets}
        selectedWalletId={walletId}
        onSelectWallet={setWalletId}
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
  onSelect: (id: string) => void;
}

function WalletPickerGroup({ label, wallets, selectedId, onSelect }: WalletPickerGroupProps) {
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
            className={cn(
              "rounded-full border-2 px-3 py-1.5 transition-colors",
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
