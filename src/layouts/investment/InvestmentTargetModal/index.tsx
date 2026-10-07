import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuCheck, LuPlus } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Monogram } from "@/components/atoms/Monogram";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Modal, ModalActions } from "@/components/molecules/Modal";
import { InstrumentFormModal } from "@/layouts/investment/InstrumentFormModal";
import { InvestmentAccountFormModal } from "@/layouts/investment/InvestmentAccountFormModal";
import { useCurrency } from "@/hooks/use-currency";
import { useInstruments } from "@/hooks/use-instruments";
import { useToast } from "@/hooks/use-toast";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";
import { cn } from "@/utils/cn";

interface InvestmentTargetModalProps {
  isOpen: boolean;
  idInstrument: string | null;
  idInvestmentAccount: string | null;
  /** Account that can't be picked (the other side of an account transfer). */
  excludeAccountId?: string;
  /** Defaults to "Catat ke investasi" / "Pilih instrumen, lalu akun tujuan". */
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: (instrument: Instrument, account: InvestmentAccount) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** "Catat ke investasi": pick an instrument, then one of its accounts, in one dialog. */
export function InvestmentTargetModal(props: InvestmentTargetModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      size="md"
      title={props.title ?? t("investment.targetTitle")}
      subtitle={props.subtitle ?? t("investment.targetSubtitle")}
    >
      {props.isOpen && <InvestmentTargetFields {...props} />}
    </Modal>
  );
}

function InvestmentTargetFields({
  idInstrument,
  idInvestmentAccount,
  excludeAccountId,
  onClose,
  onConfirm,
}: InvestmentTargetModalProps) {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { showToast } = useToast();
  const { instruments, status, loadInstruments, createInstrument, createInvestmentAccount } =
    useInstruments();
  const [instrumentId, setInstrumentId] = useState<string | null>(idInstrument);
  const [accountId, setAccountId] = useState<string | null>(idInvestmentAccount);
  const [isInstrumentFormOpen, setIsInstrumentFormOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "idle") void loadInstruments();
  }, [status, loadInstruments]);

  const instrument =
    instruments.find((item) => item.idInstrument === instrumentId) ??
    (instrumentId ? null : (instruments[0] ?? null));
  const accounts =
    instrument?.investmentAccounts.filter(
      (account) => !account.isDeleted && account.idInvestmentAccount !== excludeAccountId,
    ) ?? [];
  const account = accounts.find((item) => item.idInvestmentAccount === accountId) ?? null;

  async function handleCreateInstrument(input: Parameters<typeof createInstrument>[0]) {
    setIsSubmitting(true);
    try {
      const created = await createInstrument(input);
      setInstrumentId(created.idInstrument);
      setAccountId(null);
      setIsInstrumentFormOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateAccount(input: Parameters<typeof createInvestmentAccount>[1]) {
    if (!instrument) return;
    setIsSubmitting(true);
    try {
      const created = await createInvestmentAccount(instrument.idInstrument, input);
      setAccountId(created.idInvestmentAccount);
      setIsAccountFormOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleConfirm() {
    if (!instrument || !account) {
      showToast(t("investment.selectAccountRequiredError"), "error");
      return;
    }
    onConfirm(instrument, account);
    onClose();
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-semibold text-text-2">
            {t("investment.instrumentLabel")}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {instruments.map((item) => {
              const isSelected = item.idInstrument === instrument?.idInstrument;
              return (
                <button
                  key={item.idInstrument}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setInstrumentId(item.idInstrument);
                    setAccountId(null);
                  }}
                  className={cn(
                    "pressable flex min-w-0 flex-col items-center gap-2 rounded-[16px] border px-1.5 py-3 transition-colors duration-200",
                    isSelected
                      ? "border-primary bg-primary-soft"
                      : "border-transparent bg-surface-2 hover:bg-surface-3",
                  )}
                >
                  <Monogram
                    name={item.nameInstrument}
                    color={item.color}
                    variant="solid"
                    size="lg"
                  />
                  <span
                    className={cn(
                      "w-full truncate text-center text-[12.5px]",
                      isSelected ? "font-semibold text-primary-text" : "font-medium text-text-2",
                    )}
                  >
                    {item.nameInstrument}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsInstrumentFormOpen(true)}
              className="pressable flex min-w-0 flex-col items-center gap-2 rounded-[16px] border border-dashed border-border-strong px-1.5 py-3 text-text-2 transition-colors duration-200 hover:border-primary hover:text-primary-text"
            >
              <span className="flex size-[46px] items-center justify-center rounded-full bg-surface-2">
                <LuPlus className="size-5" />
              </span>
              <span className="w-full truncate text-center text-[12.5px] font-medium">
                {t("investment.newShort")}
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {instrument && (
            <m.div
              key={instrument.idInstrument}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="flex flex-col gap-2.5"
            >
              <span className="truncate text-[13px] font-semibold text-text-2">
                {t("investment.accountsIn", { name: instrument.nameInstrument })}
              </span>
              {accounts.length === 0 ? (
                <EmptyState title={t("investment.noAccounts")} />
              ) : (
                <div role="radiogroup" className="flex flex-col gap-2">
                  {accounts.map((item) => {
                    const isSelected = item.idInvestmentAccount === account?.idInvestmentAccount;
                    return (
                      <button
                        key={item.idInvestmentAccount}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setAccountId(item.idInvestmentAccount)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-control border px-3.5 py-3 text-left transition-colors duration-200",
                          isSelected
                            ? "border-primary bg-primary-soft"
                            : "border-border hover:bg-surface-2",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            isSelected ? "border-primary bg-primary" : "border-border-strong",
                          )}
                        >
                          {isSelected && (
                            <span className="size-2 animate-scale-in rounded-full bg-primary-fg" />
                          )}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-[14px]",
                            isSelected ? "font-semibold text-text" : "text-text",
                          )}
                        >
                          {item.nameInvestmentAccount}
                        </span>
                        <span className="shrink-0 font-num text-[13px] text-text-2 tabular">
                          {format(item.currentValue)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <Button
                type="button"
                variant="soft"
                fullWidth
                leftIcon={<LuPlus />}
                onClick={() => setIsAccountFormOpen(true)}
              >
                {t("investment.newAccount")}
              </Button>
            </m.div>
          )}
        </AnimatePresence>

        <ModalActions>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="button" leftIcon={<LuCheck />} onClick={handleConfirm} disabled={!account}>
            {t("investment.chooseAccount")}
          </Button>
        </ModalActions>
      </div>

      <InstrumentFormModal
        isOpen={isInstrumentFormOpen}
        instrument={null}
        isSubmitting={isSubmitting}
        onClose={() => setIsInstrumentFormOpen(false)}
        onSubmit={(input) => void handleCreateInstrument(input)}
      />
      <InvestmentAccountFormModal
        isOpen={isAccountFormOpen}
        instrument={instrument}
        account={null}
        isSubmitting={isSubmitting}
        onClose={() => setIsAccountFormOpen(false)}
        onSubmit={(input) => void handleCreateAccount(input)}
      />
    </>
  );
}
