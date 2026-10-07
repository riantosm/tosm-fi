import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuBellRing, LuCalendar, LuCheck, LuType } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { AmountCard } from "@/components/molecules/AmountCard";
import { CategoryPickerRow } from "@/components/molecules/CategoryPickerRow";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { PickerField } from "@/components/molecules/PickerField";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { WalletChipGroup } from "@/components/molecules/WalletChipGroup";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { DateTimePickerFields } from "@/layouts/transaction/DateTimePickerModal";
import {
  WEEKDAY_ORDER,
  describeRecurrencePreview,
  formatLongDate,
  parseScheduleDate,
  weekdayLabel,
} from "@/layouts/schedule/schedule-utils";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useSchedules } from "@/hooks/use-schedules";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { toIsoDateString } from "@/utils/report-period";
import { toIntlLocale } from "@/utils/locale";
import type { Category, CategoryType } from "@/types/category.types";
import type { Schedule, ScheduleFrequency, ScheduleInput } from "@/types/schedule.types";
import { cn } from "@/utils/cn";

interface AddScheduleModalProps {
  isOpen: boolean;
  schedule?: Schedule | null;
  onClose: () => void;
}

const FREQUENCIES: ScheduleFrequency[] = ["daily", "weekly", "monthly", "yearly"];
const FREQUENCY_KEY: Record<ScheduleFrequency, string> = {
  daily: "schedule.frequencyDaily",
  weekly: "schedule.frequencyWeekly",
  monthly: "schedule.frequencyMonthly",
  yearly: "schedule.frequencyYearly",
};
const EASE = [0.22, 1, 0.36, 1] as const;

export function AddScheduleModal({ isOpen, schedule, onClose }: AddScheduleModalProps) {
  const session = useDialogSession(isOpen);
  return (
    <AddScheduleDialog
      key={session}
      isOpen={isOpen}
      schedule={schedule ?? null}
      onClose={onClose}
    />
  );
}

function AddScheduleDialog({
  isOpen,
  schedule: scheduleProp,
  onClose,
}: {
  isOpen: boolean;
  schedule: Schedule | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { createSchedule, editSchedule } = useSchedules();
  const { showToast } = useToast();

  // Frozen for this dialog's lifetime so the exit animation keeps the same content.
  const [schedule] = useState(scheduleProp);
  const [type, setType] = useState<CategoryType>(schedule?.type ?? "expense");
  const [categoryId, setCategoryId] = useState<string | null>(schedule?.idCategory ?? null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(
    schedule?.idSubCategory ?? null,
  );
  const [amount, setAmount] = useState(schedule?.amount ?? 0);
  const [walletId, setWalletId] = useState<string | null>(schedule?.idWallet ?? null);
  const [title, setTitle] = useState(schedule?.title ?? "");
  const [notes, setNotes] = useState(schedule?.notes ?? "");
  const [frequency, setFrequency] = useState<ScheduleFrequency>(schedule?.frequency ?? "monthly");
  const [weekdays, setWeekdays] = useState<number[]>(schedule?.weekdays ?? []);
  const [startDate, setStartDate] = useState(() =>
    schedule ? parseScheduleDate(schedule.startDate) : new Date(),
  );
  const [isSaving, setIsSaving] = useState(false);

  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isSubCategoryPickerOpen, setIsSubCategoryPickerOpen] = useState(false);
  const [isAmountPickerOpen, setIsAmountPickerOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);

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

  const preview = describeRecurrencePreview(
    { frequency, weekdays, dayOfMonth: null, month: null, startDate },
    t,
    locale,
  );

  function handleTypeChange(nextType: CategoryType) {
    if (nextType === type) return;
    setType(nextType);
    setCategoryId(null);
    setSubCategoryId(null);
  }

  function handleCategorySelect(selected: Category) {
    setCategoryId(selected.idCategory);
    setSubCategoryId(null);
    setIsCategoryPickerOpen(false);
    setIsSubCategoryPickerOpen(true);
  }

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  function buildInput(): ScheduleInput | null {
    if (amount <= 0) {
      showToast(t("schedule.amountRequiredError"), "error");
      return null;
    }
    if (!category) {
      showToast(t("schedule.categoryRequiredError"), "error");
      return null;
    }
    if (!selectedWalletId) {
      showToast(t("schedule.walletRequiredError"), "error");
      return null;
    }
    if (frequency === "weekly" && weekdays.length === 0) {
      showToast(t("schedule.weekdaysRequiredError"), "error");
      return null;
    }

    return {
      type,
      idWallet: selectedWalletId,
      idCategory: category.idCategory,
      idSubCategory: subCategory?.idSubCategory ?? null,
      title: title.trim() || category.nameCategory,
      notes: notes.trim(),
      amount,
      frequency,
      weekdays: frequency === "weekly" ? weekdays : [],
      startDate: toIsoDateString(startDate),
    };
  }

  async function handleSave() {
    const input = buildInput();
    if (!input) return;

    setIsSaving(true);
    try {
      if (schedule) {
        await editSchedule(schedule.idSchedule, input);
        showToast(t("schedule.updateSuccess"), "success");
      } else {
        await createSchedule(input);
        showToast(t("schedule.createSuccess"), "success");
      }
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
        title={schedule ? t("schedule.editSchedule") : t("schedule.addSchedule")}
        subtitle={schedule?.title}
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              leftIcon={<LuCheck />}
              onClick={() => void handleSave()}
              isLoading={isSaving}
            >
              {schedule ? t("transaction.saveChanges") : t("schedule.saveSchedule")}
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-[18px]">
          <SegmentedControl
            options={[
              { value: "expense", label: t("transaction.expense") },
              { value: "income", label: t("transaction.income") },
            ]}
            value={type}
            onChange={handleTypeChange}
            size="md"
            fill
            activeClassName={type === "expense" ? "text-expense-text" : "text-income-text"}
            ariaLabel={t("transaction.typeLabel")}
          />

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

          <FormField label={t("schedule.titleLabel")} htmlFor="schedule-title">
            <Input
              id="schedule-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={category?.nameCategory ?? t("schedule.titlePlaceholder")}
              startIcon={<LuType />}
            />
          </FormField>

          <WalletChipGroup
            label={t("transaction.walletLabel")}
            wallets={wallets}
            selectedId={selectedWalletId}
            onSelect={setWalletId}
          />

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-text-2">
              {t("schedule.frequencyLabel")}
            </span>
            <SegmentedControl
              options={FREQUENCIES.map((freq) => ({ value: freq, label: t(FREQUENCY_KEY[freq]) }))}
              value={frequency}
              onChange={setFrequency}
              size="md"
              fill
              activeClassName="text-primary-text"
              ariaLabel={t("schedule.frequencyLabel")}
            />
          </div>

          <AnimatePresence initial={false}>
            {frequency === "weekly" && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div
                  role="group"
                  aria-label={t("schedule.weekdaysLabel")}
                  className="flex flex-col gap-2"
                >
                  <span className="text-[13px] font-semibold text-text-2">
                    {t("schedule.weekdaysLabel")}
                  </span>
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {WEEKDAY_ORDER.map((day) => {
                      const isSelected = weekdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleWeekday(day)}
                          className={cn(
                            "pressable flex aspect-square max-h-11 items-center justify-center rounded-full text-[13px] transition-colors duration-200",
                            isSelected
                              ? "bg-primary font-semibold text-primary-fg shadow-[0_4px_12px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                              : "bg-surface-2 font-medium text-text-2 hover:bg-surface-3 hover:text-text",
                          )}
                        >
                          {weekdayLabel(day, locale).replace(".", "")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <PickerField
            id="schedule-start"
            label={t("schedule.startLabel")}
            icon={<LuCalendar />}
            value={
              <span className="first-letter:uppercase">{formatLongDate(startDate, locale)}</span>
            }
            onClick={() => setIsStartDatePickerOpen(true)}
          />

          {preview && (
            <p
              key={preview}
              className="flex animate-fade-in items-start gap-2.5 rounded-control bg-primary-soft px-3.5 py-3 text-[12.5px] leading-[1.5] text-primary-text"
            >
              <LuBellRing className="mt-0.5 size-4 shrink-0" />
              {preview}
            </p>
          )}

          <FormField label={t("transaction.notesLabel")} htmlFor="schedule-notes">
            <Textarea
              id="schedule-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("transaction.notesPlaceholder")}
              rows={2}
            />
          </FormField>
        </div>
      </Modal>

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type={type}
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
        selectedWalletId={selectedWalletId}
        onSelectWallet={setWalletId}
        onClose={() => setIsAmountPickerOpen(false)}
        onConfirm={setAmount}
      />

      <Modal
        isOpen={isStartDatePickerOpen}
        onClose={() => setIsStartDatePickerOpen(false)}
        size="sm"
        title={t("schedule.startDateLabel")}
      >
        {isStartDatePickerOpen && (
          <DateTimePickerFields
            value={startDate}
            dateOnly
            showHeader={false}
            onClose={() => setIsStartDatePickerOpen(false)}
            onConfirm={setStartDate}
          />
        )}
      </Modal>
    </>
  );
}
