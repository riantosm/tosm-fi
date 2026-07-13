import { useEffect, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { Button } from "@/components/atoms/Button";
import { WalletCard } from "@/layouts/wallet/WalletCard";
import { AddWalletCard } from "@/layouts/wallet/AddWalletCard";
import { WalletFormModal } from "@/layouts/wallet/WalletFormModal";
import { WalletReorderItem } from "@/layouts/wallet/WalletReorderItem";
import { ViewModeToggle } from "@/layouts/wallet/ViewModeToggle";
import { useWallets } from "@/hooks/use-wallets";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useWalletViewMode } from "@/hooks/use-wallet-view-mode";
import { useToast } from "@/hooks/use-toast";
import type { WalletAccount, WalletInput } from "@/types/wallet.types";

function moveItem(list: WalletAccount[], draggedId: string, targetId: string): WalletAccount[] {
  const fromIndex = list.findIndex((item) => item.idWallet === draggedId);
  const toIndex = list.findIndex((item) => item.idWallet === targetId);
  if (fromIndex === -1 || toIndex === -1) return list;

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function WalletPage() {
  const { t } = useTranslation();
  const {
    wallets,
    status,
    loadWallets,
    createWallet,
    editWallet,
    deleteWallet,
    setPrimaryWallet,
    reorderWallets,
  } = useWallets();
  const { confirm } = useConfirmDialog();
  const { viewMode, setViewMode } = useWalletViewMode();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  const [isReordering, setIsReordering] = useState(false);
  const [localOrder, setLocalOrder] = useState<WalletAccount[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

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
        await editWallet(editingWallet.idWallet, input);
      } else {
        await createWallet(input);
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("wallet.genericError"), "error");
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
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("wallet.genericError"), "error");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetPrimary(id: string) {
    setIsSettingPrimary(true);
    try {
      await setPrimaryWallet(id);
      setIsModalOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("wallet.genericError"), "error");
    } finally {
      setIsSettingPrimary(false);
    }
  }

  function handleEnterReorder() {
    setLocalOrder(wallets);
    setIsReordering(true);
  }

  function handleCancelReorder() {
    setIsReordering(false);
  }

  async function handleSaveOrder() {
    setIsSavingOrder(true);
    try {
      await reorderWallets(localOrder.map((wallet) => wallet.idWallet));
      setIsReordering(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("wallet.genericError"), "error");
    } finally {
      setIsSavingOrder(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();
    if (draggedId && draggedId !== targetId) {
      setLocalOrder((prev) => moveItem(prev, draggedId, targetId));
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("nav.wallet")}
          </Words>

          {isReordering ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="secondary" onClick={handleCancelReorder}>
                <Words type="sm/bold" as="span">
                  {t("common.cancel")}
                </Words>
              </Button>
              <Button onClick={() => void handleSaveOrder()} isLoading={isSavingOrder}>
                <Words type="sm/bold" as="span">
                  {t("wallet.saveOrder")}
                </Words>
              </Button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={handleEnterReorder}
                aria-label={t("wallet.toggleReorder")}
                title={t("wallet.toggleReorder")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 dark:border-ink-800 dark:text-ink-400 dark:hover:bg-ink-800"
              >
                <HiOutlineArrowsUpDown className="h-4 w-4" />
              </button>
              <ViewModeToggle value={viewMode} onChange={setViewMode} />
            </div>
          )}
        </div>

        {isReordering ? (
          <div className="flex flex-col gap-2">
            {localOrder.map((wallet) => (
              <WalletReorderItem
                key={wallet.idWallet}
                wallet={wallet}
                isDragging={draggedId === wallet.idWallet}
                onDragStart={() => setDraggedId(wallet.idWallet)}
                onDragOver={(event) => handleDragOver(event, wallet.idWallet)}
                onDrop={(event) => event.preventDefault()}
                onDragEnd={() => setDraggedId(null)}
              />
            ))}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 gap-4 xl:grid-cols-3"
                : "flex flex-col gap-3"
            }
          >
            {wallets.map((wallet) => (
              <WalletCard key={wallet.idWallet} wallet={wallet} onClick={() => openEditModal(wallet)} />
            ))}
            <AddWalletCard onClick={openCreateModal} />
          </div>
        )}
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
