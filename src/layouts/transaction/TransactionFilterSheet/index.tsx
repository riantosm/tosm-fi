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
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { DateRangeFields } from "@/layouts/transaction/DateRangeFields";
import {
  DEFAULT_FILTERS,
  TYPE_FILTERS,
  formatRangeLabel,
  getSubCategoryParent,
  toggleId,
  type TransactionFilters,
} from "@/layouts/transaction/transaction-filters";
import type { TransactionSortOption } from "@/layouts/transaction/TransactionToolbar";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { cn } from "@/utils/cn";
import type { Category } from "@/types/category.types";
import type { TransactionFilterMode } from "@/types/transaction.types";
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

function Section({
  title,
  action,
  children,
}: {
  title: string;
  /** Right-aligned control on the title row. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex min-h-[30px] items-center justify-between gap-3">
        <h3 className="text-[11.5px] font-semibold tracking-[0.08em] text-text-3 uppercase">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** "Termasuk / Kecuali" toggle for a multi-select section. */
function ModeToggle({
  value,
  onChange,
}: {
  value: TransactionFilterMode;
  onChange: (mode: TransactionFilterMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      options={[
        { value: "include", label: t("transaction.filterInclude") },
        { value: "exclude", label: t("transaction.filterExclude") },
      ]}
      value={value}
      onChange={onChange}
    />
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
 * Wallets and categories are multi-select, each with an include/exclude mode.
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
  const subCategoryParent = getSubCategoryParent(draft);
  const category = categories.find((item) => item.idCategory === subCategoryParent);
  // Subcategories only survive while their single included category does.
  const setCategories = (patch: Pick<TransactionFilters, "categoryIds" | "categoryMode">) => {
    const next = { ...draft, ...patch };
    set({
      ...patch,
      subCategoryIds: getSubCategoryParent(next) === subCategoryParent ? draft.subCategoryIds : [],
    });
  };

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
          <Section
            title={t("transaction.filterWallet")}
            action={
              <ModeToggle value={draft.walletMode} onChange={(walletMode) => set({ walletMode })} />
            }
          >
            <div className="flex flex-wrap gap-2">
              <Chip active={draft.walletIds.length === 0} onClick={() => set({ walletIds: [] })}>
                {t("transaction.allWallets")}
              </Chip>
              {wallets.map((wallet) => (
                <Chip
                  key={wallet.idWallet}
                  active={draft.walletIds.includes(wallet.idWallet)}
                  dot={wallet.color}
                  onClick={() => set({ walletIds: toggleId(draft.walletIds, wallet.idWallet) })}
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

          <Section
            title={t("transaction.filterCategory")}
            action={
              <ModeToggle
                value={draft.categoryMode}
                onChange={(categoryMode) =>
                  setCategories({ categoryIds: draft.categoryIds, categoryMode })
                }
              />
            }
          >
            <div className="flex flex-wrap gap-2">
              <Chip
                active={draft.categoryIds.length === 0}
                onClick={() => setCategories({ categoryIds: [], categoryMode: draft.categoryMode })}
              >
                {t("transaction.allCategories")}
              </Chip>
              {categories.map((item) => (
                <Chip
                  key={item.idCategory}
                  active={draft.categoryIds.includes(item.idCategory)}
                  icon={createElement(resolveCategoryIcon(item.icon))}
                  onClick={() =>
                    setCategories({
                      categoryIds: toggleId(draft.categoryIds, item.idCategory),
                      categoryMode: draft.categoryMode,
                    })
                  }
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
                  <Section
                    title={t("transaction.filterSubCategory")}
                    action={
                      <ModeToggle
                        value={draft.subCategoryMode}
                        onChange={(subCategoryMode) => set({ subCategoryMode })}
                      />
                    }
                  >
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        active={draft.subCategoryIds.length === 0}
                        icon={<LuLayers />}
                        onClick={() => set({ subCategoryIds: [] })}
                      >
                        {t("transaction.allSub")}
                      </Chip>
                      {renderedCategory.subCategories.map((sub) => (
                        <Chip
                          key={sub.idSubCategory}
                          active={draft.subCategoryIds.includes(sub.idSubCategory)}
                          icon={createElement(resolveCategoryIcon(sub.icon))}
                          onClick={() =>
                            set({
                              subCategoryIds: toggleId(draft.subCategoryIds, sub.idSubCategory),
                            })
                          }
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
