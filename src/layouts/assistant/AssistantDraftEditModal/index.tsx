import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowUpDown, LuCalendarClock, LuCheck, LuType } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
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
import { useCurrency } from "@/hooks/use-currency";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { InvestmentAccountPickerButton } from "@/layouts/investment/InvestmentAccountPickerButton";
import { AmountCalculatorModal } from "@/layouts/transaction/AmountCalculatorModal";
import { DateTimePickerModal } from "@/layouts/transaction/DateTimePickerModal";
import { SelectCategoryModal } from "@/layouts/transaction/SelectCategoryModal";
import { SelectSubCategoryModal } from "@/layouts/transaction/SelectSubCategoryModal";
import type { AssistantDraft, AssistantDraftKind } from "@/types/assistant.types";
import type { Category } from "@/types/category.types";
import type { Instrument } from "@/types/instrument.types";
import type { WalletAccount } from "@/types/wallet.types";
import { formatDateTimeLabel } from "@/utils/tx-time";

interface AssistantDraftEditModalProps {
  isOpen: boolean;
  draft: AssistantDraft | null;
  wallets: WalletAccount[];
  categories: Category[];
  instruments: Instrument[];
  onClose: () => void;
  onApply: (draft: AssistantDraft) => void;
}

type SwitchableKind = "expense" | "income" | "transfer";

const SWITCHABLE: AssistantDraftKind[] = ["expense", "income", "transfer"];

const KIND_ACTIVE_CLASS: Record<SwitchableKind, string> = {
  expense: "text-expense-text",
  income: "text-income-text",
  transfer: "text-primary-text",
};

/**
 * Manual edit of one Catat Cepat preview row. Nothing is saved here: the
 * edited draft goes back into the preview, and Simpan commits the batch as
 * before. A fresh dialog is mounted on every open.
 */
export function AssistantDraftEditModal(props: AssistantDraftEditModalProps) {
  const session = useDialogSession(props.isOpen);
  if (!props.draft) return null;
  return <DraftEditDialog key={session} {...props} draft={props.draft} />;
}

function DraftEditDialog({
  isOpen,
  draft: draftProp,
  wallets,
  categories,
  instruments,
  onClose,
  onApply,
}: AssistantDraftEditModalProps & { draft: AssistantDraft }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();
  const { showToast } = useToast();

  // Frozen for this dialog's lifetime: the parent clears it while we animate out.
  const [draft] = useState(draftProp);
  const [kind, setKind] = useState<AssistantDraftKind>(draft.kind);
  const [title, setTitle] = useState(draft.title);
  const [notes, setNotes] = useState(draft.notes);
  const [amount, setAmount] = useState(draft.amount);
  const [target, setTarget] = useState(draft.balanceAfter ?? 0);
  const [date, setDate] = useState(() => new Date(draft.date));
  const [idWallet, setIdWallet] = useState(draft.idWallet);
  const [idWalletFrom, setIdWalletFrom] = useState(draft.idWalletFrom);
  const [idWalletTo, setIdWalletTo] = useState(draft.idWalletTo);
  const [idCategory, setIdCategory] = useState(draft.idCategory);
  const [idSubCategory, setIdSubCategory] = useState(draft.idSubCategory);
  const [idInstrument, setIdInstrument] = useState(draft.idInstrument);
  const [idAccount, setIdAccount] = useState(draft.idInvestmentAccount);
  const [idInstrumentTo, setIdInstrumentTo] = useState(draft.idInstrumentTo);
  const [idAccountTo, setIdAccountTo] = useState(draft.idInvestmentAccountTo);

  const [isAmountOpen, setAmountOpen] = useState(false);
  const [isDateOpen, setDateOpen] = useState(false);
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setSubCategoryOpen] = useState(false);

  const isSwitchable = SWITCHABLE.includes(draft.kind);
  const hasTarget = kind === "correction" || kind === "investmentPl";
  /** Which category type this kind's wallet transaction needs, if any. */
  const categoryType: "income" | "expense" | null =
    kind === "income" || kind === "expense"
      ? kind
      : kind === "investmentIn"
        ? "expense"
        : kind === "investmentOut" && idWallet
          ? "income"
          : null;

  const category = categories.find((c) => c.idCategory === idCategory) ?? null;
  const subCategory =
    category?.subCategories.find((s) => s.idSubCategory === idSubCategory) ?? null;
  const wallet = wallets.find((w) => w.idWallet === idWallet);
  const account = instruments
    .find((i) => i.idInstrument === idInstrument)
    ?.investmentAccounts.find((a) => a.idInvestmentAccount === idAccount);

  function handleKindChange(next: SwitchableKind) {
    if (next === kind) return;
    setKind(next);
    // A category of the other type doesn't fit anymore.
    if (category && category.type !== next) {
      setIdCategory(null);
      setIdSubCategory(null);
    }
    if (next === "transfer") {
      setIdWalletFrom((from) => from ?? idWallet);
    } else if (kind === "transfer") {
      setIdWallet((current) => current ?? idWalletFrom);
    }
  }

  function handleCategorySelect(selected: Category) {
    setIdCategory(selected.idCategory);
    setIdSubCategory(null);
    setCategoryOpen(false);
    if (selected.subCategories.length > 0) setSubCategoryOpen(true);
  }

  function fail(message: string) {
    showToast(message, "error");
    return null;
  }

  function build(): AssistantDraft | null {
    if (!hasTarget && amount <= 0) return fail(t("transaction.amountRequiredError"));
    const needsAccount = kind.startsWith("investment");
    if (needsAccount && (!idInstrument || !idAccount)) {
      return fail(t("investment.selectAccountRequiredError"));
    }

    const next: AssistantDraft = {
      ...draft,
      kind,
      title: title.trim(),
      notes: notes.trim(),
      amount,
      date: date.toISOString(),
      idWallet: null,
      idCategory: null,
      idSubCategory: null,
      idWalletFrom: null,
      idWalletTo: null,
      idInstrument: needsAccount ? idInstrument : null,
      idInvestmentAccount: needsAccount ? idAccount : null,
      idInstrumentTo: null,
      idInvestmentAccountTo: null,
      balanceBefore: undefined,
      balanceAfter: undefined,
      changed: undefined,
      error: undefined,
      missing: undefined,
    };

    switch (kind) {
      case "transfer":
        if (!idWalletFrom || !idWalletTo) {
          return fail(t("transaction.transferWalletRequiredError"));
        }
        if (idWalletFrom === idWalletTo) return fail(t("transaction.transferSameWalletError"));
        next.idWalletFrom = idWalletFrom;
        next.idWalletTo = idWalletTo;
        break;
      case "correction": {
        if (!wallet) return fail(t("transaction.walletRequiredError"));
        if (target === wallet.balance) {
          return fail(t("assistant.editBalanceUnchanged", { amount: format(wallet.balance) }));
        }
        next.idWallet = wallet.idWallet;
        next.balanceBefore = wallet.balance;
        next.balanceAfter = target;
        next.amount = Math.abs(target - wallet.balance);
        break;
      }
      case "investmentPl": {
        const before = account?.currentValue ?? 0;
        if (target < 0) return fail(t("assistant.editNegativeValue"));
        if (target === before) {
          return fail(t("assistant.editValueUnchanged", { amount: format(before) }));
        }
        next.balanceBefore = before;
        next.balanceAfter = target;
        next.amount = Math.abs(target - before);
        break;
      }
      case "investmentTransfer":
        if (!idInstrumentTo || !idAccountTo) {
          return fail(t("investment.selectAccountRequiredError"));
        }
        if (idAccountTo === idAccount) return fail(t("assistant.editSameAccount"));
        if (account && amount > account.currentValue) {
          return fail(t("assistant.editOverAccount", { amount: format(account.currentValue) }));
        }
        next.idInstrumentTo = idInstrumentTo;
        next.idInvestmentAccountTo = idAccountTo;
        break;
      case "investmentOut":
        if (account && amount > account.currentValue) {
          return fail(t("assistant.editOverAccount", { amount: format(account.currentValue) }));
        }
        next.idWallet = idWallet;
        break;
      default:
        // income, expense, investmentIn: a wallet is required.
        if (!idWallet) return fail(t("transaction.walletRequiredError"));
        next.idWallet = idWallet;
    }

    if (categoryType) {
      if (!category || category.type !== categoryType) {
        return fail(t("transaction.categoryRequiredError"));
      }
      next.idCategory = category.idCategory;
      next.idSubCategory = subCategory?.idSubCategory ?? null;
    }
    return next;
  }

  function handleApply() {
    const next = build();
    if (!next) return;
    onApply(next);
  }

  const amountCard = (
    <AmountCard
      amount={hasTarget ? target : amount}
      onPickAmount={() => setAmountOpen(true)}
      pickAmountLabel={t("transaction.amountTitle")}
      caption={
        kind === "correction"
          ? t("assistant.editNewBalance")
          : kind === "investmentPl"
            ? t("assistant.editNewValue")
            : undefined
      }
      footer={
        kind === "correction" && wallet ? (
          <span className="text-[12.5px] text-text-3">
            {t("assistant.editCurrentBalance", { amount: format(wallet.balance) })}
          </span>
        ) : kind === "investmentPl" && account ? (
          <span className="text-[12.5px] text-text-3">
            {t("assistant.editCurrentValue", { amount: format(account.currentValue) })}
          </span>
        ) : undefined
      }
      header={
        categoryType && (
          <CategoryPickerRow
            category={category}
            subCategory={subCategory}
            placeholder={t("transaction.selectCategoryPlaceholder")}
            onClick={() => setCategoryOpen(true)}
          />
        )
      }
    />
  );

  const accountField = (label: string) => (
    <FieldGroup label={label}>
      <InvestmentAccountPickerButton
        idInstrument={idInstrument}
        idInvestmentAccount={idAccount}
        excludeAccountId={kind === "investmentTransfer" ? (idAccountTo ?? undefined) : undefined}
        onChange={(instrument, picked) => {
          setIdInstrument(instrument.idInstrument);
          setIdAccount(picked.idInvestmentAccount);
        }}
      />
    </FieldGroup>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={t("assistant.editTitle")}
        subtitle={t("assistant.editSubtitle")}
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="button" leftIcon={<LuCheck />} onClick={handleApply}>
              {t("assistant.editApply")}
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-[18px]">
          {isSwitchable && (
            <SegmentedControl
              options={[
                { value: "expense", label: t("transaction.expense") },
                { value: "income", label: t("transaction.income") },
                { value: "transfer", label: t("transaction.transfer") },
              ]}
              value={kind as SwitchableKind}
              onChange={handleKindChange}
              size="md"
              fill
              activeClassName={KIND_ACTIVE_CLASS[kind as SwitchableKind]}
              ariaLabel={t("transaction.typeLabel")}
            />
          )}

          {kind.startsWith("investment") &&
            accountField(
              kind === "investmentTransfer"
                ? t("assistant.editAccountFrom")
                : t("assistant.editAccount"),
            )}

          {kind === "investmentTransfer" && (
            <FieldGroup label={t("assistant.editAccountTo")}>
              <InvestmentAccountPickerButton
                idInstrument={idInstrumentTo}
                idInvestmentAccount={idAccountTo}
                excludeAccountId={idAccount ?? undefined}
                onChange={(instrument, picked) => {
                  setIdInstrumentTo(instrument.idInstrument);
                  setIdAccountTo(picked.idInvestmentAccount);
                }}
              />
            </FieldGroup>
          )}

          {amountCard}

          {kind === "transfer" && (
            <div className="flex flex-col gap-3 rounded-[18px] border border-border p-4">
              <WalletChipGroup
                label={t("transaction.transferFrom")}
                wallets={wallets}
                selectedId={idWalletFrom}
                disabledId={idWalletTo}
                onSelect={setIdWalletFrom}
              />
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <IconButton
                  label={t("transaction.swapWallets")}
                  icon={<LuArrowUpDown />}
                  size="sm"
                  className="bg-primary-soft text-primary-text hover:bg-primary-soft"
                  onClick={() => {
                    setIdWalletFrom(idWalletTo);
                    setIdWalletTo(idWalletFrom);
                  }}
                />
                <span className="h-px flex-1 bg-border" />
              </div>
              <WalletChipGroup
                label={t("transaction.transferTo")}
                wallets={wallets}
                selectedId={idWalletTo}
                disabledId={idWalletFrom}
                onSelect={setIdWalletTo}
              />
            </div>
          )}

          {(kind === "income" ||
            kind === "expense" ||
            kind === "correction" ||
            kind === "investmentIn") && (
            <WalletChipGroup
              label={
                kind === "investmentIn"
                  ? t("assistant.editWalletFrom")
                  : t("transaction.walletLabel")
              }
              wallets={wallets}
              selectedId={idWallet}
              onSelect={setIdWallet}
            />
          )}

          {kind === "investmentOut" && (
            <FieldGroup label={t("assistant.editWalletTo")}>
              <div className="flex flex-wrap gap-2">
                <Chip
                  size="sm"
                  variant="outline"
                  active={idWallet === null}
                  onClick={() => {
                    setIdWallet(null);
                    setIdCategory(null);
                    setIdSubCategory(null);
                  }}
                >
                  {t("assistant.editNoWallet")}
                </Chip>
                {wallets.map((w) => (
                  <Chip
                    key={w.idWallet}
                    size="sm"
                    variant="outline"
                    dot={w.color}
                    active={w.idWallet === idWallet}
                    onClick={() => setIdWallet(w.idWallet)}
                  >
                    {w.nameWallet}
                  </Chip>
                ))}
              </div>
            </FieldGroup>
          )}

          <FormField label={t("transaction.titleLabel")} htmlFor="draft-title">
            <Input
              id="draft-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("transaction.titlePlaceholder")}
              startIcon={<LuType />}
            />
          </FormField>

          <FormField label={t("transaction.notesLabel")} htmlFor="draft-notes">
            <Textarea
              id="draft-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("transaction.notesPlaceholder")}
              rows={2}
            />
          </FormField>

          <PickerField
            id="draft-date"
            label={t("transaction.dateTimeLabel")}
            icon={<LuCalendarClock />}
            value={formatDateTimeLabel(date, language, {
              today: t("transaction.today"),
              yesterday: t("transaction.yesterday"),
            })}
            onClick={() => setDateOpen(true)}
          />
        </div>
      </Modal>

      {categoryType && (
        <>
          <SelectCategoryModal
            isOpen={isCategoryOpen}
            type={categoryType}
            selectedId={idCategory}
            onClose={() => setCategoryOpen(false)}
            onSelect={handleCategorySelect}
          />
          <SelectSubCategoryModal
            isOpen={isSubCategoryOpen}
            category={category}
            selectedId={idSubCategory}
            onBack={() => {
              setSubCategoryOpen(false);
              setCategoryOpen(true);
            }}
            onClose={() => setSubCategoryOpen(false)}
            onSelect={(selected) => {
              setIdSubCategory(selected ? selected.idSubCategory : null);
              setSubCategoryOpen(false);
            }}
          />
        </>
      )}

      <AmountCalculatorModal
        isOpen={isAmountOpen}
        amount={hasTarget ? target : amount}
        wallets={[]}
        selectedWalletId={null}
        onSelectWallet={() => {}}
        onClose={() => setAmountOpen(false)}
        onConfirm={hasTarget ? setTarget : setAmount}
      />

      <DateTimePickerModal
        isOpen={isDateOpen}
        value={date}
        onClose={() => setDateOpen(false)}
        onConfirm={setDate}
      />
    </>
  );
}

/** Label + control that isn't a single input (pickers, chip rows). */
function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-text-2">{label}</span>
      {children}
    </div>
  );
}
