import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import { Modal } from "@/components/molecules/Modal";
import { Words } from "@/components/atoms/Words";
import { ModalCloseButton } from "@/components/atoms/ModalCloseButton";
import { InstrumentFormModal } from "@/layouts/investment/InstrumentFormModal";
import { useInstruments } from "@/hooks/use-instruments";
import { useToast } from "@/hooks/use-toast";
import type { Instrument } from "@/types/instrument.types";

interface SelectInstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (instrument: Instrument) => void;
}

export function SelectInstrumentModal({ isOpen, onClose, onSelect }: SelectInstrumentModalProps) {
  const { t } = useTranslation();
  const { instruments, createInstrument } = useInstruments();
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(input: Parameters<typeof createInstrument>[0]) {
    setIsSubmitting(true);
    try {
      const created = await createInstrument(input);
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
          <div className="flex shrink-0 items-center justify-between gap-2">
            <Words as="h2" type="lg/bold" className="text-ink-900 dark:text-ink-50">
              {t("investment.selectInstrumentTitle")}
            </Words>
            <ModalCloseButton onClose={onClose} />
          </div>

          <div className="-mx-2 min-h-0 overflow-y-auto px-2">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {instruments.map((instrument) => (
                <button
                  key={instrument.idInstrument}
                  type="button"
                  onClick={() => onSelect(instrument)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold uppercase transition-transform hover:scale-105"
                    style={{ backgroundColor: `${instrument.color}33`, color: instrument.color }}
                  >
                    {instrument.nameInstrument.slice(0, 2)}
                  </div>
                  <Words
                    type="xs/regular"
                    className="line-clamp-1 text-center text-ink-700 dark:text-ink-300"
                  >
                    {instrument.nameInstrument}
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

      <InstrumentFormModal
        isOpen={isCreateOpen}
        instrument={null}
        isSubmitting={isSubmitting}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(input) => void handleCreate(input)}
      />
    </>
  );
}
