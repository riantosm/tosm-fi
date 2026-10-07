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
  LuSparkles,
  LuTag,
  LuX,
} from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { TxRowBase, type TxAmountTone } from "@/components/molecules/TxRowBase";
import { resolveCategoryIcon } from "@/constants/category-icons";
import { useCurrency } from "@/hooks/use-currency";
import { useLanguage } from "@/hooks/use-language";
import type { AssistantDraft, AssistantMessage } from "@/types/assistant.types";
import type { Category } from "@/types/category.types";
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

/** Signed effect of a draft on the user's money (transfers move money, they don't change it). */
function signedAmount(draft: AssistantDraft): number {
  switch (draft.kind) {
    case "income":
    case "investmentOut":
      return draft.amount;
    case "expense":
    case "investmentIn":
      return -draft.amount;
    case "correction":
      return (draft.balanceAfter ?? 0) - (draft.balanceBefore ?? 0);
    default:
      return 0;
  }
}

/** Catat Cepat preview (V2/PreviewCard): drafts grouped per day, totals, Simpan/Batal and its after-states. */
export function AssistantPreviewCard({
  message,
  previousDrafts,
  wallets,
  categories,
  onSave,
  onCancel,
}: AssistantPreviewCardProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { language } = useLanguage();
  const locale = toIntlLocale(language);

  const walletOf = (id: string | null) => wallets.find((w) => w.idWallet === id);
  const categoryOf = (id: string | null) => categories.find((c) => c.idCategory === id);
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
    if (draft.changed.includes("amount"))
      chips.push(`${format(before.amount)} → ${format(draft.amount)}`);
    if (draft.changed.includes("wallet"))
      chips.push(
        `${walletOf(before.idWallet)?.nameWallet ?? "-"} → ${walletOf(draft.idWallet)?.nameWallet ?? "-"}`,
      );
    return chips;
  }

  function renderRow(draft: AssistantDraft) {
    const wallet = walletOf(draft.idWallet);
    const amount = signedAmount(draft);
    let icon: ReactNode;
    let color: string | undefined;
    let tone: "neutral" | "income" | "expense" | "investment" | "primary" = "neutral";
    let meta = "";
    let amountText = signed(amount);
    let amountTone = toneOf(amount);

    switch (draft.kind) {
      case "income":
      case "expense": {
        const category = categoryOf(draft.idCategory);
        const sub = category?.subCategories.find((s) => s.idSubCategory === draft.idSubCategory);
        icon = createElement(category ? resolveCategoryIcon(category.icon) : LuTag);
        color = category?.color;
        tone = draft.kind;
        meta = [
          sub ? `${category?.nameCategory} › ${sub.nameSubCategory}` : category?.nameCategory,
          wallet?.nameWallet,
        ]
          .filter(Boolean)
          .join(" · ");
        break;
      }
      case "transfer":
        icon = <LuArrowLeftRight />;
        color = "#8A94A0";
        meta = `${walletOf(draft.idWalletFrom)?.nameWallet ?? "?"} → ${walletOf(draft.idWalletTo)?.nameWallet ?? "?"}`;
        amountText = format(draft.amount);
        amountTone = "neutral";
        break;
      case "correction":
        icon = <LuScale />;
        tone = "primary";
        meta = `${format(draft.balanceBefore ?? 0)} → ${format(draft.balanceAfter ?? 0)}`;
        break;
      case "investmentIn":
        icon = <LuArrowDownLeft />;
        tone = "investment";
        meta = wallet?.nameWallet ?? "";
        break;
      case "investmentOut":
        icon = <LuArrowUpRight />;
        tone = "investment";
        meta = wallet?.nameWallet ?? "";
        break;
      default:
        icon = <LuSparkles />;
        tone = "investment";
        amountText = format(draft.amount);
        amountTone = "neutral";
    }

    const chips = changeChips(draft);
    const row = (
      <TxRowBase
        icon={icon}
        color={color}
        tone={tone}
        title={draft.title}
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
