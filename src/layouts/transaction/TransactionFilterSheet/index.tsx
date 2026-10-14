import { createElement, useState, type ComponentType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import {
  LuArrowDownWideNarrow,
  LuArrowUpNarrowWide,
  LuCalendarArrowDown,
  LuCalendarArrowUp,
  LuCalendarRange,
  LuCheck,
  LuLayers,
  LuSlidersHorizontal,
} from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Chip } from "@/components/molecules/Chip";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { PickerField } from "@/components/molecules/PickerField";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { DateRangeFields } from "@/layouts/transaction/DateRangeFields";
import {
  DEFAULT_FILTERS,
  TYPE_FILTERS,
  formatRangeLabel,
  type TransactionFilters,
} from "@/layouts/transaction/transaction-filters";
import type { TransactionSortOption } from "@/layouts/transaction/TransactionToolbar";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { cn } from "@/utils/cn";
import type { Category } from "@/types/category.types";
import type { WalletAccount } from "@/types/wallet.types";

type IconComponent = ComponentType<{ className?: string }>;

const SORT_OPTIONS: { value: TransactionSortOption; icon: IconComponent }[] = [
  { value: "dateDesc", icon: LuCalendarArrowDown },
  { value: "dateAsc", icon: LuCalendarArrowUp },
  { value: "amountDesc", icon: LuArrowDownWideNarrow },
  { value: "amountAsc", icon: LuArrowUpNarrowWide },
];

interface TransactionFilterButtonProps {
  /** Number of non-default sheet settings; > 0 highlights the button and shows a badge. */
  count: number;
  onClick: () => void;
  /** pill = labelled desktop button; icon = round phone app-bar button. */
  variant?: "pill" | "icon";
}

/** "Filter" trigger with an active-count badge. */
export function TransactionFilterButton({
  count,
  onClick,
  variant = "pill",
}: TransactionFilterButtonProps) {
  const { t } = useTranslation();
  const isActive = count > 0;
  const badge = isActive && (
    <span
      key={count}
      className="flex h-[18px] min-w-[18px] animate-scale-in items-center justify-center rounded-full bg-primary px-1 text-[11px] leading-none font-semibold text-primary-fg tabular"
    >
      {count}
    </span>
  );

  if (variant === "icon") {
    return (
      <span className="relative inline-flex">
        <IconButton
          label={t("transaction.filterTitle")}
          icon={<LuSlidersHorizontal />}
          variant="surface"
          size="lg"
          tooltip={false}
          className={cn(isActive && "bg-primary-soft text-primary-text")}
          onClick={onClick}
        />
        {badge && (
          <span className="pointer-events-none absolute -top-1 -right-1 rounded-full ring-2 ring-bg">
            {badge}
          </span>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pressable flex h-[38px] items-center gap-2 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors",
        isActive
          ? "border-primary bg-primary-soft text-primary-text"
          : "border-border bg-surface text-text-2 hover:bg-surface-2 hover:text-text",
      )}
    >
      <LuSlidersHorizontal className="size-4 shrink-0" />
      {t("transaction.filterTitle")}
      {badge}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-[11.5px] font-semibold tracking-[0.08em] text-text-3 uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

interface TransactionFilterSheetProps {
  isOpen: boolean;
  value: TransactionFilters;
  wallets: WalletAccount[];
  categories: Category[];
  /** Month being viewed — where the date-range calendar opens. */
  month: Date;
  locale: string;
  onApply: (filters: TransactionFilters) => void;
  onClose: () => void;
}

/**
 * Transactions filter sheet: wallet, type, category → subcategory, date range, sort.
 * Choices stay a draft until "Terapkan", so the list doesn't refetch on every chip tap.
 */
export function TransactionFilterSheet(props: TransactionFilterSheetProps) {
  const session = useDialogSession(props.isOpen);
  return <FilterSheetDialog key={session} {...props} />;
}

function FilterSheetDialog({
  isOpen,
  value,
  wallets,
  categories,
  month,
  locale,
  onApply,
  onClose,
}: TransactionFilterSheetProps) {
  const { t } = useTranslation();
  // Every open starts from the filters currently applied.
  const [draft, setDraft] = useState(value);
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  const set = (patch: Partial<TransactionFilters>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const category = categories.find((item) => item.idCategory === draft.categoryId);

  // Keep the last category's subcategories rendered while the row animates closed.
  const [renderedCategory, setRenderedCategory] = useState(category);
  if (category && renderedCategory !== category) setRenderedCategory(category);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={t("transaction.filterTitle")}
        subtitle={t("transaction.filterSubtitle")}
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={() => setDraft(DEFAULT_FILTERS)}>
              {t("transaction.reset")}
            </Button>
            <Button
              type="button"
              leftIcon={<LuCheck />}
              onClick={() => {
                onApply(draft);
                onClose();
              }}
            >
              {t("transaction.applyDateFilter")}
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-5">
          <Section title={t("transaction.filterWallet")}>
            <div className="flex flex-wrap gap-2">
              <Chip active={draft.walletId === "all"} onClick={() => set({ walletId: "all" })}>
                {t("transaction.allWallets")}
              </Chip>
              {wallets.map((wallet) => (
                <Chip
                  key={wallet.idWallet}
                  active={draft.walletId === wallet.idWallet}
                  dot={wallet.color}
                  onClick={() => set({ walletId: wallet.idWallet })}
                  className="max-w-[220px]"
                >
                  {wallet.nameWallet}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title={t("transaction.filterType")}>
            <div className="flex flex-wrap gap-2">
              <Chip active={draft.type === "all"} onClick={() => set({ type: "all" })}>
                {t("transaction.allTypes")}
              </Chip>
              {TYPE_FILTERS.map(({ value: option, labelKey, icon: Icon }) => (
                <Chip
                  key={option}
                  active={draft.type === option}
                  icon={<Icon />}
                  onClick={() => set({ type: option })}
                >
                  {t(labelKey)}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title={t("transaction.filterCategory")}>
            <div className="flex flex-wrap gap-2">
              <Chip
                active={draft.categoryId === "all"}
                onClick={() => set({ categoryId: "all", subCategoryId: "all" })}
              >
                {t("transaction.allCategories")}
              </Chip>
              {categories.map((item) => (
                <Chip
                  key={item.idCategory}
                  active={draft.categoryId === item.idCategory}
                  icon={createElement(resolveCategoryIcon(item.icon))}
                  onClick={() => set({ categoryId: item.idCategory, subCategoryId: "all" })}
                  className="max-w-[220px]"
                >
                  {item.nameCategory}
                </Chip>
              ))}
            </div>
          </Section>

          <AnimatePresence initial={false}>
            {category && renderedCategory && renderedCategory.subCategories.length > 0 && (
              <m.div
                key="sub"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="-mt-5 overflow-hidden"
              >
                <div className="pt-5">
                  <Section title={t("transaction.filterSubCategory")}>
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        active={draft.subCategoryId === "all"}
                        icon={<LuLayers />}
                        onClick={() => set({ subCategoryId: "all" })}
                      >
                        {t("transaction.allSub")}
                      </Chip>
                      {renderedCategory.subCategories.map((sub) => (
                        <Chip
                          key={sub.idSubCategory}
                          active={draft.subCategoryId === sub.idSubCategory}
                          icon={createElement(resolveCategoryIcon(sub.icon))}
                          onClick={() => set({ subCategoryId: sub.idSubCategory })}
                          className="max-w-[220px]"
                        >
                          {sub.nameSubCategory}
                        </Chip>
                      ))}
                    </div>
                  </Section>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <Section title={t("transaction.dateFilterTitle")}>
            <PickerField
              icon={<LuCalendarRange />}
              value={formatRangeLabel(draft.range, locale) || t("transaction.filterAllDates")}
              onClick={() => setIsRangeOpen(true)}
            />
          </Section>

          <Section title={t("transaction.sortTitle")}>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(({ value: option, icon: Icon }) => (
                <Chip
                  key={option}
                  active={draft.sort === option}
                  icon={<Icon />}
                  onClick={() => set({ sort: option })}
                >
                  {t(`transaction.sortOptions.${option}`)}
                </Chip>
              ))}
            </div>
          </Section>
        </div>
      </Modal>

      <Modal isOpen={isRangeOpen} onClose={() => setIsRangeOpen(false)} size="md" hideClose>
        <DateRangeFields
          value={draft.range}
          initialMonth={month}
          onClose={() => setIsRangeOpen(false)}
          onApply={(range) => {
            set({ range });
            setIsRangeOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
