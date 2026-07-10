import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { WalletCard } from "@/layouts/wallet/WalletCard";
import { AddWalletCard } from "@/layouts/wallet/AddWalletCard";
import { WalletFormModal } from "@/layouts/wallet/WalletFormModal";
import { useWallets } from "@/hooks/use-wallets";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { WalletAccount, WalletInput } from "@/types/wallet.types";

export function WalletPage() {
  const { t } = useTranslation();
  const { wallets, status, loadWallets, createWallet, editWallet, deleteWallet, setPrimaryWallet } =
    useWallets();
  const { confirm } = useConfirmDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  useEffect(() => {
    if (status === "idle") void loadWallets();
  }, [status, loadWallets]);

  function openCreateModal() {
    setEditingWallet(null);
    setIsModalOpen(true);
  }

  function openEditModal(wallet: WalletAccount) {
    setEditingWallet(wallet);
    setIsModalOpen(true);
  }

  async function handleSubmit(input: WalletInput) {
    setIsSubmitting(true);
    try {
      if (editingWallet) {
        await editWallet(editingWallet.id, input);
      } else {
        await createWallet(input);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: t("wallet.deleteConfirmTitle"),
      description: t("wallet.deleteConfirmDescription"),
      confirmLabel: t("wallet.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteWallet(id);
      setIsModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetPrimary(id: string) {
    setIsSettingPrimary(true);
    try {
      await setPrimaryWallet(id);
      setIsModalOpen(false);
    } finally {
      setIsSettingPrimary(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
          {t("nav.wallet")}
        </Words>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} onClick={() => openEditModal(wallet)} />
          ))}
          <AddWalletCard onClick={openCreateModal} />
        </div>
      </div>

      <WalletFormModal
        isOpen={isModalOpen}
        wallet={editingWallet}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        isSettingPrimary={isSettingPrimary}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onSetPrimary={handleSetPrimary}
      />
    </DashboardLayout>
  );
}
