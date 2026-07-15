import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Words } from "@/components/atoms/Words";
import { InvestmentAccountFormModal } from "@/layouts/investment/InvestmentAccountFormModal";
import { useInstruments } from "@/hooks/use-instruments";
import { useToast } from "@/hooks/use-toast";
import type { Instrument, InvestmentAccount } from "@/types/instrument.types";

interface SelectInvestmentAccountModalProps {
  isOpen: boolean;
  instrument: Instrument | null;
  excludeAccountId?: string;
  onClose: () => void;
  onSelect: (account: InvestmentAccount) => void;
}

export function SelectInvestmentAccountModal({
  isOpen,
  instrument,
  excludeAccountId,
  onClose,
  onSelect,
}: SelectInvestmentAccountModalProps) {
  const { t } = useTranslation();
  const { createInvestmentAccount } = useInstruments();
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(input: Parameters<typeof createInvestmentAccount>[1]) {
    if (!instrument) return;
    setIsSubmitting(true);
    try {
      const created = await createInvestmentAccount(instrument.idInstrument, input);
      setIsCreateOpen(false);
      onSelect(created);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("investment.genericError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex max-h-[75vh] flex-col gap-4">
          <Words as="h2" type="lg/bold" className="shrink-0 text-ink-900 dark:text-ink-50">
            {t("investment.selectAccountTitle")}
          </Words>

          <div className="-mx-2 min-h-0 overflow-y-auto px-2">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {instrument?.investmentAccounts
                .filter(
                  (account) => !account.isDeleted && account.idInvestmentAccount !== excludeAccountId,
                )
                .map((account) => (
                <button
                  key={account.idInvestmentAccount}
                  type="button"
                  onClick={() => onSelect(account)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold uppercase transition-transform hover:scale-105"
                    style={{
                      backgroundColor: `${instrument.color}33`,
                      color: instrument.color,
                    }}
                  >
                    {account.nameInvestmentAccount.slice(0, 2)}
                  </div>
                  <Words
                    type="xs/regular"
                    className="line-clamp-1 text-center text-ink-700 dark:text-ink-300"
                  >
                    {account.nameInvestmentAccount}
                  </Words>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 text-ink-300 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-ink-700 dark:text-ink-600 dark:hover:border-primary-500 dark:hover:text-primary-400">
                  <HiOutlinePlus className="h-6 w-6" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <InvestmentAccountFormModal
        isOpen={isCreateOpen}
        account={null}
        isSubmitting={isSubmitting}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(input) => void handleCreate(input)}
      />
    </>
  );
}
