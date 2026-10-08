import { useEffect, useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowLeftRight, LuArrowRight, LuArrowUpDown } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { AmountInput } from "@/layouts/investment/AmountInput";
import { InvestmentAccountSummary } from "@/layouts/investment/InvestmentAccountSummary";
import { InvestmentDateTimeField } from "@/layouts/investment/InvestmentDateTimeField";
import { InvestmentTargetModal } from "@/layouts/investment/InvestmentTargetModal";
import { useDialogSession } from "@/hooks/use-dialog-session";
import { useInstruments } from "@/hooks/use-instruments";
import { useInvestmentTransactions } from "@/hooks/use-investment-transactions";
import { useMoneyFormat } from "@/hooks/use-money-format";
import { useToast } from "@/hooks/use-toast";
import { parseFormattedNumber } from "@/utils/number-input";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

interface TransferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountRef {
  idInstrument: string;
  idInvestmentAccount: string;
}

const FORM_ID = "investment-transfer-form";

export function TransferFormModal(props: TransferFormModalProps) {
  const session = useDialogSession(props.isOpen);
  return <TransferFormDialog key={session} {...props} />;
}

function TransferFormDialog({ isOpen, onClose }: TransferFormModalProps) {
  const { t } = useTranslation();
  const { formatNumber } = useMoneyFormat();
  const { instruments, status, loadInstruments } = useInstruments();
  const { createTransfer } = useInvestmentTransactions();
  const { showToast } = useToast();

  const [from, setFrom] = useState<AccountRef | null>(null);
  const [to, setTo] = useState<AccountRef | null>(null);
  const [picking, setPicking] = useState<"from" | "to" | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [date, setDate] = useState(() => new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "idle") void loadInstruments();
  }, [status, loadInstruments]);

  function resolve(
    ref: AccountRef | null,
  ): { instrument: Instrument; account: InvestmentAccount } | null {
    if (!ref) return null;
    const instrument = instruments.find((item) => item.idInstrument === ref.idInstrument);
    const account = instrument?.investmentAccounts.find(
      (item) => item.idInvestmentAccount === ref.idInvestmentAccount,
    );
    return instrument && account ? { instrument, account } : null;
  }

  const source = resolve(from);
  const destination = resolve(to);
  const amount = parseFormattedNumber(amountInput);
  const pickingRef = picking === "from" ? from : picking === "to" ? to : null;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount <= 0) {
      showToast(t("transaction.amountRequiredError"), "error");
      return;
    }
    if (!from) {
      showToast(t("investment.selectSourceAccountRequiredError"), "error");
      return;
    }
    if (!to) {
      showToast(t("investment.selectDestinationAccountRequiredError"), "error");
      return;
    }
    if (from.idInvestmentAccount === to.idInvestmentAccount) {
      showToast(t("investment.transferSameAccountError"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransfer({
        idInstrument: from.idInstrument,
        idInvestmentAccount: from.idInvestmentAccount,
        idInstrumentTo: to.idInstrument,
        idInvestmentAccountTo: to.idInvestmentAccount,
        amount,
        date: date.toISOString(),
      });
      showToast(t("investment.transferSuccess"), "success");
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderSide(side: "from" | "to") {
    const resolved = side === "from" ? source : destination;
    return (
      <InvestmentAccountSummary
        eyebrow={
          side === "from" ? t("investment.transferFromLabel") : t("investment.transferToLabel")
        }
        title={
          resolved
            ? resolved.account.nameInvestmentAccount
            : t("investment.selectAccountPlaceholder")
        }
        subtitle={resolved?.instrument.nameInstrument}
        valueLabel={resolved ? t("investment.valueShort") : undefined}
        value={resolved ? formatNumber(resolved.account.currentValue) : undefined}
        isEmpty={!resolved}
        onClick={() => setPicking(side)}
      />
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title={t("investment.transferTitle")}
        subtitle={t("investment.transferSubtitle")}
        footer={
          <ModalActions>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              leftIcon={<LuArrowLeftRight />}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {t("investment.transferAction")}
            </Button>
          </ModalActions>
        }
      >
        <form
          id={FORM_ID}
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-[18px]"
        >
          <div className="flex flex-col items-center gap-1.5">
            {renderSide("from")}
            <button
              type="button"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              aria-label={t("investment.swapAccounts")}
              className="pressable flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary-text transition-transform duration-300 hover:rotate-180"
            >
              <LuArrowUpDown className="size-4" />
            </button>
            {renderSide("to")}
          </div>

          <FormField label={t("investment.transferAmountLabel")} htmlFor="transfer-amount">
            <AmountInput id="transfer-amount" value={amountInput} onChange={setAmountInput} />
          </FormField>

          <InvestmentDateTimeField id="transfer" value={date} onChange={setDate} />

          {source && destination && amount > 0 && (
            <div className="grid animate-fade-in grid-cols-2 gap-2.5">
              <BalancePreview
                name={source.account.nameInvestmentAccount}
                before={formatNumber(source.account.currentValue)}
                after={formatNumber(source.account.currentValue - amount)}
              />
              <BalancePreview
                name={destination.account.nameInvestmentAccount}
                before={formatNumber(destination.account.currentValue)}
                after={formatNumber(destination.account.currentValue + amount)}
              />
            </div>
          )}
        </form>
      </Modal>

      <InvestmentTargetModal
        isOpen={picking !== null}
        idInstrument={pickingRef?.idInstrument ?? null}
        idInvestmentAccount={pickingRef?.idInvestmentAccount ?? null}
        excludeAccountId={picking === "to" ? from?.idInvestmentAccount : to?.idInvestmentAccount}
        title={t("investment.pickAccountTitle")}
        subtitle={
          picking === "to"
            ? t("investment.pickDestinationSubtitle")
            : t("investment.pickSourceSubtitle")
        }
        onClose={() => setPicking(null)}
        onConfirm={(instrument, account) => {
          const ref = {
            idInstrument: instrument.idInstrument,
            idInvestmentAccount: account.idInvestmentAccount,
          };
          if (picking === "from") setFrom(ref);
          else setTo(ref);
        }}
      />
    </>
  );
}

function BalancePreview({ name, before, after }: { name: string; before: string; after: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-control border border-border px-3 py-2.5">
      <span className="truncate text-[12px] text-text-3">{name}</span>
      <span className="flex min-w-0 items-center gap-1.5 font-num text-[12.5px] tabular">
        <span className="truncate text-text-3">{before}</span>
        <LuArrowRight className="size-3 shrink-0 text-text-3" />
        <span className="truncate font-semibold text-text">{after}</span>
      </span>
    </div>
  );
}
