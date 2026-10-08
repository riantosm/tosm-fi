import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { InvestmentAccountSummary } from "@/layouts/investment/InvestmentAccountSummary";
import { InvestmentDateTimeField } from "@/layouts/investment/InvestmentDateTimeField";
import { formatPercent, timelineValueAt } from "@/layouts/investment/investment-ui";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useLanguage } from "@/hooks/use-language";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { useToast } from "@/hooks/use-toast";
import { formatNumberInput, parseFormattedNumber } from "@/utils/number-input";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";
import type { TimelinePoint } from "@/types/investment-transaction.types";

interface ProfitLossFormModalProps {
  isOpen: boolean;
  instrument: Instrument | null;
  account: InvestmentAccount | null;
  /** The account's running-total series — lets a backdated update compare against the value on that date. */
  timeline?: TimelinePoint[];
  onClose: () => void;
}

const FORM_ID = "profit-loss-form";

/** Sizes the centered amount input to its text (separators are narrower than digits). */
function inputWidth(value: string): string {
  const separators = (value.match(/[.,]/g) ?? []).length;
  const digits = Math.max(1, value.length - separators);
  return `${digits + separators * 0.45 + 0.3}ch`;
}

export function ProfitLossFormModal(props: ProfitLossFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <ProfitLossFormDialog key={session} {...props} />;
}

function ProfitLossFormDialog({
  isOpen,
  instrument: instrumentProp,
  account: accountProp,
  timeline: timelineProp,
  onClose,
}: ProfitLossFormModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { symbol, formatNumber } = useMoneyFormat();
  const { createProfitLoss } = useInvestmentTransactions();
  const { showToast } = useToast();

  // Frozen for this dialog's lifetime so the exit animation keeps the same account.
  const [instrument] = useState(instrumentProp);
  const [account] = useState(accountProp);
  const [timeline] = useState(timelineProp ?? []);
  const [newValueInput, setNewValueInput] = useState(
    formatNumberInput(String(account?.currentValue ?? 0).replace(".", ",")),
  );
  const [date, setDate] = useState(() => new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The new value is the value AS OF `date` (the backend computes the delta the
  // same way), so a backdated update compares against the ledger on that date.
  const latestPoint = timeline.at(-1);
  const isBackdated =
    latestPoint !== undefined && date.getTime() < new Date(latestPoint.date).getTime();
  const recordedValue = isBackdated
    ? timelineValueAt(timeline, date)
    : (account?.currentValue ?? 0);

  const newValue = parseFormattedNumber(newValueInput);
  const delta = newValue - recordedValue;
  const isLoss = delta < 0;
  const deltaPercent = recordedValue > 0 ? (delta / recordedValue) * 100 : 0;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!instrument || !account) return;
    if (newValue < 0) {
      showToast(t("investment.negativeValueError"), "error");
      return;
    }
    if (newValue === recordedValue) {
      showToast(t("investment.noOpProfitLossError"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfitLoss({
        idInstrument: instrument.idInstrument,
        idInvestmentAccount: account.idInvestmentAccount,
        newCurrentValue: newValue,
        date: date.toISOString(),
      });
      showToast(t("investment.profitLossSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={t("investment.profitLossTitle")}
      subtitle={t("investment.profitLossSubtitle")}
      footer={
        <ModalActions>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            leftIcon={<LuCheck />}
            isLoading={isSubmitting}
            disabled={isSubmitting || delta === 0}
          >
            {t("investment.saveValue")}
          </Button>
        </ModalActions>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-[18px]"
      >
        {account && (
          <InvestmentAccountSummary
            title={account.nameInvestmentAccount}
            subtitle={
              isBackdated
                ? t("investment.recordedValueOn", {
                    date: date.toLocaleDateString(toIntlLocale(language), {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                    amount: formatNumber(recordedValue),
                  })
                : t("investment.recordedValue", { amount: formatNumber(recordedValue) })
            }
          />
        )}

        <InvestmentDateTimeField id="pl" value={date} onChange={setDate} />

        <label
          htmlFor="pl-new-value"
          className="flex cursor-text flex-col items-center gap-1 rounded-[20px] border-[1.5px] border-border bg-surface px-5 py-4 transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]"
        >
          <span className="text-[12.5px] text-text-3">{t("investment.newCurrentValueLabel")}</span>
          <span className="flex max-w-full items-baseline justify-center gap-2">
            <span className="shrink-0 font-display text-[18px] font-medium text-text-3">
              {symbol}
            </span>
            <input
              id="pl-new-value"
              type="text"
              inputMode="decimal"
              value={newValueInput}
              onChange={(event) => setNewValueInput(formatNumberInput(event.target.value))}
              onFocus={(event) => event.target.select()}
              placeholder="0"
              autoFocus
              style={{ width: inputWidth(newValueInput) }}
              className="max-w-[260px] min-w-0 bg-transparent text-center font-num text-[36px] leading-[1.15] font-semibold tracking-[-0.02em] text-text tabular outline-none placeholder:text-text-3"
            />
          </span>
        </label>

        <div
          className={cn(
            "flex items-center gap-3 rounded-[18px] px-3.5 py-3 transition-colors duration-300",
            delta === 0 ? "bg-surface-2" : isLoss ? "bg-expense-soft" : "bg-income-soft",
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full bg-surface",
              delta === 0 ? "text-text-3" : isLoss ? "text-expense-text" : "text-income-text",
            )}
          >
            {isLoss ? (
              <LuTrendingDown className="size-[18px]" />
            ) : (
              <LuTrendingUp className="size-[18px]" />
            )}
          </span>
          {delta === 0 ? (
            <span className="text-[13px] text-text-2">{t("investment.profitLossNoChange")}</span>
          ) : (
            <span
              className={cn(
                "flex min-w-0 flex-col gap-px",
                isLoss ? "text-expense-text" : "text-income-text",
              )}
            >
              <span className="font-num text-[14px] font-semibold tabular">
                {isLoss
                  ? t("investment.lossAmount", { amount: formatNumber(Math.abs(delta)) })
                  : t("investment.profitAmount", { amount: formatNumber(delta) })}
              </span>
              <span className="text-[12.5px]">
                {isLoss
                  ? t("investment.downFromRecorded", {
                      percent: formatPercent(deltaPercent, language),
                    })
                  : t("investment.upFromRecorded", {
                      percent: formatPercent(deltaPercent, language),
                    })}
              </span>
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}
