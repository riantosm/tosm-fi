import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import { AddTransactionModal } from "@/layouts/transaction/AddTransactionModal";

export function AddTransactionFab() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("transaction.addTransaction")}
        title={t("transaction.addTransaction")}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-500 dark:bg-primary-500 dark:text-ink-950 dark:hover:bg-primary-400"
      >
        <HiOutlinePlus className="h-6 w-6" />
      </button>

      <AddTransactionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
