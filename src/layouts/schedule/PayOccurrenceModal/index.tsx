import { createElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCalendarClock, LuCheck } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { AmountCard } from "@/components/molecules/AmountCard";
import { CategoryPickerRow } from "@/components/molecules/CategoryPickerRow";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { PickerField } from "@/components/molecules/PickerField";
import { WalletChipGroup } from "@/components/molecules/WalletChipGroup";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useScheduleOccurrences } from "@/hooks/use-schedule-occurrences";
import { useCurrency } from "@/hooks/use-currency";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import type { Category } from "@/types/category.types";
import type { ScheduleOccurrence } from "@/types/schedule-occurrence.types";
import { toIntlLocale } from "@/utils/locale";
import { formatDateTimeLabel } from "@/utils/tx-time";

interface PayOccurrenceModalProps {
  isOpen: boolean;
  occurrence: ScheduleOccurrence | null;
  onClose: () => void;
}

export function PayOccurrenceModal({ isOpen, occurrence, onClose }: PayOccurrenceModalProps) {
  const session = useDialogSession(isOpen);
  return (
    <PayOccurrenceDialog
      key={session}
      isOpen={isOpen && Boolean(occurrence)}
      occurrence={occurrence}
      onClose={onClose}
    />
  );
}

function PayOccurrenceDialog({
  isOpen,
  occurrence: occurrenceProp,
  onClose,
}: {
  isOpen: boolean;
  occurrence: ScheduleOccurrence | null;
  onClose: () => void;
}) {
  // Frozen for this dialog's lifetime: the parent clears its own state while we animate out.
  const [occurrence] = useState(occurrenceProp);
  if (!occurrence)
    return (
      <Modal isOpen={false} onClose={onClose}>
        {null}
      </Modal>
    );
  return <PayOccurrenceFields isOpen={isOpen} occurrence={occurrence} onClose={onClose} />;
}

function PayOccurrenceFields({
  isOpen,
  occurrence,
  onClose,
}: {
  isOpen: boolean;
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

  const category = categoryId
    ? (categories.find((item) => item.idCategory === categoryId) ?? null)
    : null;
  const subCategory = subCategoryId
    ? (category?.subCategories.find((sub) => sub.idSubCategory === subCategoryId) ?? null)
    : null;
  const originalCategory = categories.find((item) => item.idCategory === occurrence.idCategory);

  const due = new Date(occurrence.dueDate);
  const dueLabel =
    due.toDateString() === new Date().toDateString()
      ? t("schedule.dueToday")
      : t("schedule.dueOn", {
          date: due.toLocaleDateString(toIntlLocale(language), { day: "numeric", month: "short" }),
        });
  const isIncome = occurrence.type === "income";

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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={t("schedule.payTitle")}
        subtitle={isIncome ? t("schedule.payIncomeSubtitle") : t("schedule.payExpenseSubtitle")}
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              {t("schedule.later")}
            </Button>
            <Button
              type="button"
              leftIcon={<LuCheck />}
              onClick={() => void handleConfirm()}
              isLoading={isSaving}
            >
              <span className="truncate">
                {t(isIncome ? "schedule.receiveAmount" : "schedule.payAmount", {
                  amount: format(amount),
                })}
              </span>
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-[18px]">
          <div className="flex items-center gap-3 rounded-[18px] bg-investment-soft p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-investment-text">
              {createElement(
                originalCategory ? resolveCategoryIcon(originalCategory.icon) : LuCalendarClock,
                {
                  className: "size-[18px]",
                },
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="truncate text-[14px] font-semibold text-text">
                {occurrence.title}
              </span>
              <span className="truncate text-[12.5px] text-text-2">
                {[originalCategory?.nameCategory, dueLabel].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-investment-text">
              {t("schedule.scheduledBadge")}
            </span>
          </div>

          <AmountCard
            amount={amount}
            onPickAmount={() => setIsAmountPickerOpen(true)}
            pickAmountLabel={t("transaction.amountTitle")}
            header={
              <CategoryPickerRow
                category={category}
                subCategory={subCategory}
                placeholder={t("transaction.selectCategoryPlaceholder")}
                onClick={() => setIsCategoryPickerOpen(true)}
              />
            }
          />

          <PickerField
            id="pay-date"
            label={t("transaction.dateTimeLabel")}
            icon={<LuCalendarClock />}
            value={formatDateTimeLabel(date, language, {
              today: t("transaction.today"),
              yesterday: t("transaction.yesterday"),
            })}
            onClick={() => setIsDateTimePickerOpen(true)}
          />

          <WalletChipGroup
            label={isIncome ? t("schedule.receiveTo") : t("schedule.payFrom")}
            wallets={wallets}
            selectedId={walletId}
            onSelect={setWalletId}
          />
        </div>
      </Modal>

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type={occurrence.type}
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
