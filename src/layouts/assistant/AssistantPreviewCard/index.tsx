import { createElement, Fragment, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  LuArrowDown,
  LuArrowDownLeft,
  LuArrowLeftRight,
  LuArrowUpRight,
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuCircleX,
  LuScale,
  LuTag,
  LuTrendingUpDown,
  LuX,
} from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { TxRowBase, type TxAmountTone } from "@/components/molecules/TxRowBase";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import { useInvestmentLabels } from "@/layouts/investment/use-investment-labels";
import type { AssistantDraft, AssistantMessage } from "@/types/assistant.types";
import type { Category } from "@/types/category.types";
import type { Instrument } from "@/types/instrument.types";
import type { WalletAccount } from "@/types/wallet.types";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";
import { formatTxTime } from "@/utils/tx-time";

type PreviewMessage = Extract<AssistantMessage, { kind: "preview" }>;

interface AssistantPreviewCardProps {
  message: PreviewMessage;
  /** Drafts of the preview this one revised, to show "old → new" chips. */
  previousDrafts?: AssistantDraft[];
  wallets: WalletAccount[];
  categories: Category[];
  instruments: Instrument[];
  onSave: () => void;
  onCancel: () => void;
}

const TOTAL_CLASS: Record<TxAmountTone, string> = {
  income: "text-income-text",
  expense: "text-expense-text",
  neutral: "text-text",
  muted: "text-text-2",
};

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Signed effect of a draft on the user's wallets — the "netto dompet" total.
 * Transfers only move money; investment moves count only for their wallet
 * side (top up from a wallet, withdrawal into one); value updates don't touch
 * wallets at all.
 */
function signedAmount(draft: AssistantDraft): number {
  switch (draft.kind) {
    case "income":
      return draft.amount;
    case "investmentOut":
      return draft.idWallet ? draft.amount : 0;
    case "expense":
    case "investmentIn":
      return -draft.amount;
    case "correction":
      return (draft.balanceAfter ?? 0) - (draft.balanceBefore ?? 0);
    default:
      return 0;
  }
}

/** What the row's own amount shows: the ledger's view for investment rows (top up +, tarik −). */
function rowAmount(draft: AssistantDraft): number | null {
  switch (draft.kind) {
    case "investmentIn":
      return draft.amount;
    case "investmentOut":
      return -draft.amount;
    case "investmentPl":
      return (draft.balanceAfter ?? 0) - (draft.balanceBefore ?? 0);
    case "transfer":
    case "investmentTransfer":
      return null;
    default:
      return signedAmount(draft);
  }
}

/** Catat Cepat preview (V2/PreviewCard): drafts grouped per day, totals, Simpan/Batal and its after-states. */
export function AssistantPreviewCard({
  message,
  previousDrafts,
  wallets,
  categories,
  instruments,
  onSave,
  onCancel,
}: AssistantPreviewCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const resolveLabels = useInvestmentLabels(instruments);
  const locale = toIntlLocale(language);

  const walletOf = (id: string | null) => wallets.find((w) => w.idWallet === id);
  const walletName = (id: string | null) => walletOf(id)?.nameWallet ?? "-";
  const categoryOf = (id: string | null) => categories.find((c) => c.idCategory === id);
  const categoryLabel = (draft: AssistantDraft) => {
    const category = categoryOf(draft.idCategory);
    const sub = category?.subCategories.find((s) => s.idSubCategory === draft.idSubCategory);
    return sub ? `${category?.nameCategory} › ${sub.nameSubCategory}` : category?.nameCategory;
  };
  const accountOf = (idInstrument: string | null, idAccount: string | null) =>
    idInstrument
      ? resolveLabels(idInstrument, idAccount)
      : { instrumentName: "-", accountName: null };
  const signed = (value: number) =>
    `${value > 0 ? "+" : value < 0 ? "−" : ""}${format(Math.abs(value))}`;
  const toneOf = (value: number): TxAmountTone =>
    value > 0 ? "income" : value < 0 ? "expense" : "neutral";

  const { drafts, status } = message;
  const errorCount = drafts.filter((d) => d.error).length;
  const isPending = status === "pending" || status === "saving";

  const now = new Date();
  const today = dayKey(now.toISOString());
  now.setDate(now.getDate() - 1);
  const yesterday = dayKey(now.toISOString());
  const groups: { key: string; label: string; items: AssistantDraft[] }[] = [];
  for (const draft of [...drafts].sort((a, b) => b.date.localeCompare(a.date))) {
    const key = dayKey(draft.date);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const label =
        key === today
          ? t("assistant.today")
          : key === yesterday
            ? t("assistant.yesterday")
            : new Date(draft.date).toLocaleDateString(locale, {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
      group = { key, label, items: [] };
      groups.push(group);
    }
    group.items.push(draft);
  }

  const total = drafts.reduce((sum, d) => sum + signedAmount(d), 0);
  const kinds = new Set(drafts.map((d) => d.kind));
  const totalLabel =
    kinds.size > 1
      ? t("assistant.netWallet", { count: drafts.length })
      : t("assistant.transactionCount", { count: drafts.length });

  function changeChips(draft: AssistantDraft): string[] {
    const before = previousDrafts?.find((p) => p.idDraft === draft.idDraft);
    if (!before || !draft.changed?.length) return [];
    const chips: string[] = [];
    const changed = (field: string) => draft.changed?.includes(field);
    if (changed("amount")) {
      // Corrections / value updates are revised by their target, not the delta.
      const hasTarget = draft.kind === "correction" || draft.kind === "investmentPl";
      const from = hasTarget ? (before.balanceAfter ?? 0) : before.amount;
      const to = hasTarget ? (draft.balanceAfter ?? 0) : draft.amount;
      chips.push(`${format(from)} → ${format(to)}`);
    }
    if (changed("wallet")) {
      const legs = (d: AssistantDraft) =>
        d.kind === "transfer"
          ? `${walletName(d.idWalletFrom)} → ${walletName(d.idWalletTo)}`
          : walletName(d.idWallet);
      chips.push(`${legs(before)} → ${legs(draft)}`);
    }
    if (changed("category"))
      chips.push(`${categoryLabel(before) ?? "-"} → ${categoryLabel(draft) ?? "-"}`);
    if (changed("account")) {
      const name = (d: AssistantDraft) =>
        accountOf(d.idInstrument, d.idInvestmentAccount).accountName ?? "-";
      chips.push(`${name(before)} → ${name(draft)}`);
    }
    if (changed("date")) {
      const day = (iso: string) =>
        new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
      chips.push(`${day(before.date)} → ${day(draft.date)}`);
    }
    return chips;
  }

  function renderRow(draft: AssistantDraft) {
    const wallet = walletOf(draft.idWallet);
    const source = accountOf(draft.idInstrument, draft.idInvestmentAccount);
    const sourceLabel = [source.instrumentName, source.accountName].filter(Boolean).join(" · ");
    const shown = rowAmount(draft);
    let title = draft.title;
    let icon: ReactNode;
    let color: string | undefined;
    let tone: "neutral" | "income" | "expense" | "investment" | "primary" = "neutral";
    let meta = "";
    let amountText = shown === null ? format(draft.amount) : signed(shown);
    let amountTone: TxAmountTone = shown === null ? "neutral" : toneOf(shown);

    // Same looks as the Transaksi list and the investment ledger rows.
    switch (draft.kind) {
      case "income":
      case "expense": {
        const category = categoryOf(draft.idCategory);
        icon = createElement(category ? resolveCategoryIcon(category.icon) : LuTag);
        color = category?.color;
        tone = draft.kind;
        meta = [categoryLabel(draft), wallet?.nameWallet].filter(Boolean).join(" · ");
        break;
      }
      case "transfer":
        icon = <LuArrowLeftRight />;
        color = "#8A94A0";
        meta = `${walletName(draft.idWalletFrom)} → ${walletName(draft.idWalletTo)}`;
        break;
      case "correction":
        icon = <LuScale />;
        tone = "primary";
        meta = `${wallet?.nameWallet ?? "-"} · ${format(draft.balanceBefore ?? 0)} → ${format(draft.balanceAfter ?? 0)}`;
        break;
      case "investmentIn":
        icon = <LuArrowDownLeft />;
        tone = "income";
        title = source.accountName
          ? t("investment.row.topUp", { account: source.accountName })
          : draft.title;
        meta = `${wallet?.nameWallet ?? "-"} → ${sourceLabel}`;
        break;
      case "investmentOut":
        icon = <LuArrowUpRight />;
        tone = "expense";
        title = wallet
          ? t("assistant.withdrawTo", { wallet: wallet.nameWallet })
          : source.accountName
            ? t("investment.row.withdraw", { account: source.accountName })
            : draft.title;
        meta = wallet ? `${sourceLabel} → ${wallet.nameWallet}` : sourceLabel;
        break;
      case "investmentTransfer": {
        const destination = accountOf(draft.idInstrumentTo, draft.idInvestmentAccountTo);
        icon = <LuArrowLeftRight />;
        tone = "primary";
        title = destination.accountName
          ? t("investment.row.transferTo", { account: destination.accountName })
          : draft.title;
        meta = `${sourceLabel} → ${destination.accountName ?? "-"}`;
        amountText = format(draft.amount);
        amountTone = "neutral";
        break;
      }
      case "investmentPl":
        icon = <LuTrendingUpDown />;
        tone = "investment";
        title = source.accountName
          ? t("investment.row.update", { account: source.accountName })
          : draft.title;
        meta = `${source.instrumentName} · ${format(draft.balanceBefore ?? 0)} → ${format(draft.balanceAfter ?? 0)}`;
        break;
    }

    const chips = changeChips(draft);
    const row = (
      <TxRowBase
        icon={icon}
        color={color}
        tone={tone}
        title={title}
        meta={meta}
        amount={amountText}
        amountTone={amountTone}
        caption={formatTxTime(draft.date, language)}
        className="px-0"
      />
    );

    return (
      <div
        key={draft.idDraft}
        className={cn(
          "rounded-control transition-colors duration-300",
          draft.error && "border border-expense bg-expense-soft px-2.5 pb-2.5",
          !draft.error && chips.length > 0 && "bg-primary-soft px-2.5 pb-2.5",
        )}
      >
        {row}
        {draft.notes && (
          <p className="truncate pb-1.5 pl-14 text-[12.5px] text-text-2">
            {t("assistant.noteLabel", { note: draft.notes })}
          </p>
        )}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-14">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-surface px-2 py-[3px] text-[11.5px] font-semibold text-primary-text tabular"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
        {draft.error && (
          <p className="flex items-center gap-1.5 pl-14 text-[12px] font-semibold text-expense-text">
            <LuCircleAlert className="size-3.5 shrink-0" />
            {draft.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-card border bg-surface p-4 shadow-card transition-opacity duration-300 sm:p-5",
        errorCount > 0 && isPending ? "border-expense" : "border-border",
        status === "replaced" && "opacity-70",
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold tracking-[0.08em] text-text-3 uppercase">
          {t("assistant.previewEyebrow")}
        </span>
        <h3 className="font-display text-[17px] font-semibold text-text sm:text-[18px]">
          {t("assistant.previewTitle")}
        </h3>
      </div>

      {errorCount > 0 && isPending && (
        <div className="mt-3 flex items-start gap-2.5 rounded-[14px] bg-expense-soft px-3.5 py-3">
          <LuCircleAlert className="mt-0.5 size-4 shrink-0 text-expense-text" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13.5px] font-semibold text-expense-text">
              {t("assistant.validationTitle")}
            </span>
            <span className="text-[13px] text-text-2">
              {t("assistant.validationBody", { count: errorCount })}
            </span>
          </div>
        </div>
      )}

      {groups.map((group) => {
        const dayTotal = group.items.reduce((sum, d) => sum + signedAmount(d), 0);
        return (
          <Fragment key={group.key}>
            <div className="flex items-center justify-between pt-3.5 pb-0.5 text-[12px] text-text-3">
              <span className="font-semibold tracking-[0.05em] uppercase">{group.label}</span>
              <span className="tabular">{signed(dayTotal)}</span>
            </div>
            <div className="flex flex-col gap-1">{group.items.map(renderRow)}</div>
          </Fragment>
        );
      })}

      <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[13px] text-text-2">{totalLabel}</span>
          <span
            className={cn("font-num text-[15px] font-semibold tabular", TOTAL_CLASS[toneOf(total)])}
          >
            {signed(total)}
          </span>
        </div>

        {isPending && (
          <>
            <div className="flex gap-2.5 [&>*]:flex-1">
              <Button
                type="button"
                variant="outline"
                leftIcon={<LuX />}
                onClick={onCancel}
                disabled={status === "saving"}
              >
                {t("assistant.cancel")}
              </Button>
              <Button
                type="button"
                leftIcon={<LuCheck />}
                onClick={onSave}
                isLoading={status === "saving"}
                disabled={errorCount > 0}
              >
                {status === "saving" ? t("assistant.saving") : t("assistant.save")}
              </Button>
            </div>
            <p className="text-center text-[12px] text-text-3">
              {errorCount > 0 ? t("assistant.validationHint") : t("assistant.typeToSave")}
            </p>
          </>
        )}

        {status === "saved" && (
          <StatusPill className="bg-income-soft text-income-text" icon={<LuCircleCheck />}>
            {t("assistant.saved", {
              time: formatTxTime(message.savedAt ?? new Date().toISOString(), language),
            })}
          </StatusPill>
        )}
        {status === "cancelled" && (
          <StatusPill className="bg-surface-2 text-text-3" icon={<LuCircleX />}>
            {t("assistant.cancelledStatus")}
          </StatusPill>
        )}
        {status === "replaced" && (
          <StatusPill className="bg-surface-2 text-text-3" icon={<LuArrowDown />}>
            {t("assistant.previewReplaced")}
          </StatusPill>
        )}
      </div>
    </div>
  );
}

function StatusPill({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div
      className={cn(
        "flex animate-fade-in items-center justify-center gap-2 rounded-control px-3 py-2.5 text-[13px] font-semibold [&_svg]:size-4",
        className,
      )}
    >
      {icon}
      {children}
    </div>
  );
}
