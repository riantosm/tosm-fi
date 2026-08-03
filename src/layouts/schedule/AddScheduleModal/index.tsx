import { createElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCalendarDays, HiOutlineTag } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { DateTimePickerFields } from "@/layouts/transaction/DateTimePickerModal";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useSchedules } from "@/hooks/use-schedules";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { toIsoDateString } from "@/utils/report-period";
import type { Category, CategoryType } from "@/types/category.types";
import type { Schedule, ScheduleFrequency, ScheduleInput } from "@/types/schedule.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";

interface AddScheduleModalProps {
  isOpen: boolean;
  schedule?: Schedule | null;
  onClose: () => void;
}

const FREQUENCIES: ScheduleFrequency[] = ["daily", "weekly", "monthly", "yearly"];
const WEEKDAY_REFERENCE_SUNDAY = new Date(2023, 0, 1);

function getWeekdayLabels(locale: string): string[] {
  try {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(WEEKDAY_REFERENCE_SUNDAY);
      date.setDate(WEEKDAY_REFERENCE_SUNDAY.getDate() + index);
      return formatter.format(date);
    });
  } catch {
    return ["S", "M", "T", "W", "T", "F", "S"];
  }
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

export function AddScheduleModal({ isOpen, schedule, onClose }: AddScheduleModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      {isOpen && <AddScheduleFields schedule={schedule ?? null} onClose={onClose} />}
    </Modal>
  );
}

function AddScheduleFields({
  schedule,
  onClose,
}: {
  schedule: Schedule | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { categories, status: categoriesStatus, loadCategories } = useCategories();
  const { wallets, status: walletsStatus, loadWallets } = useWallets();
  const { createSchedule, editSchedule } = useSchedules();
  const { format } = useCurrency();
  const { showToast } = useToast();

  const [type, setType] = useState<CategoryType>(schedule?.type ?? "expense");
  const [categoryId, setCategoryId] = useState<string | null>(schedule?.idCategory ?? null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(schedule?.idSubCategory ?? null);
  const [amount, setAmount] = useState(schedule?.amount ?? 0);
  const [walletId, setWalletId] = useState<string | null>(schedule?.idWallet ?? null);
  const [title, setTitle] = useState(schedule?.title ?? "");
  const [notes, setNotes] = useState(schedule?.notes ?? "");
  const [frequency, setFrequency] = useState<ScheduleFrequency>(schedule?.frequency ?? "monthly");
  const [weekdays, setWeekdays] = useState<number[]>(schedule?.weekdays ?? []);
  const [startDate, setStartDate] = useState(() =>
    schedule ? new Date(schedule.startDate) : new Date(),
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

  const category = categoryId ? (categories.find((item) => item.idCategory === categoryId) ?? null) : null;
  const subCategory = subCategoryId
    ? (category?.subCategories.find((sub) => sub.idSubCategory === subCategoryId) ?? null)
    : null;

  const CategoryIcon = category ? resolveCategoryIcon(category.icon) : HiOutlineTag;
  const weekdayLabels = getWeekdayLabels(language);

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
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
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
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <Words as="h2" type="xl/bold" className="text-ink-900 dark:text-ink-50">
            {schedule ? t("schedule.editSchedule") : t("schedule.addSchedule")}
          </Words>
          <ModalCloseButton onClose={onClose} />
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

            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("schedule.titlePlaceholder")}
            />

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("schedule.notesPlaceholder")}
              rows={3}
              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-colors focus:border-primary-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:border-primary-500"
            />

            <WalletPickerGroup
              label={t("transaction.walletLabel")}
              wallets={wallets}
              selectedId={selectedWalletId}
              onSelect={setWalletId}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Words type="xs/bold" className="uppercase tracking-wide text-ink-400 dark:text-ink-500">
                {t("schedule.frequencyLabel")}
              </Words>
              <div className="grid grid-cols-4 gap-1 rounded-xl border border-ink-200 p-1 dark:border-ink-800">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={cn(
                      "rounded-lg py-2 text-center transition-colors",
                      frequency === freq
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                        : "text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800",
                    )}
                  >
                    <Words type="xs/bold" as="span">
                      {t(`schedule.frequency${freq.charAt(0).toUpperCase()}${freq.slice(1)}`)}
                    </Words>
                  </button>
                ))}
              </div>
            </div>

            {frequency === "weekly" && (
              <div className="flex flex-col gap-2">
                <Words type="xs/bold" className="uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  {t("schedule.weekdaysLabel")}
                </Words>
                <div className="flex flex-wrap gap-2">
                  {weekdayLabels.map((label, day) => {
                    const isSelected = weekdays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected
                            ? "border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                            : "border-ink-200 text-ink-500 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800",
                        )}
                      >
                        <Words type="xs/bold" as="span">
                          {label}
                        </Words>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsStartDatePickerOpen(true)}
              className="flex items-center gap-3 rounded-2xl border border-ink-200 p-3 transition-colors hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800">
                <HiOutlineCalendarDays className="h-4 w-4 text-ink-500 dark:text-ink-400" />
              </div>
              <div className="flex flex-col items-start">
                <Words type="xxs/bold" className="uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  {t("schedule.startDateLabel")}
                </Words>
                <Words type="sm/bold" className="text-ink-900 dark:text-ink-50">
                  {formatDateLabel(startDate, language, t("transaction.today"))}
                </Words>
              </div>
            </button>
          </div>
        </div>

        <Button onClick={() => void handleSave()} isLoading={isSaving} className="w-full">
          <Words type="sm/bold" as="span">
            {t("schedule.save")}
          </Words>
        </Button>
      </div>

      <SelectCategoryModal
        isOpen={isCategoryPickerOpen}
        type={type}
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
        selectedWalletId={selectedWalletId}
        onSelectWallet={setWalletId}
        onClose={() => setIsAmountPickerOpen(false)}
        onConfirm={setAmount}
      />

      <Modal isOpen={isStartDatePickerOpen} onClose={() => setIsStartDatePickerOpen(false)} size="md">
        {isStartDatePickerOpen && (
          <DateTimePickerFields
            value={startDate}
            dateOnly
            title={t("schedule.startDateLabel")}
            onClose={() => setIsStartDatePickerOpen(false)}
            onConfirm={setStartDate}
          />
        )}
      </Modal>
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
