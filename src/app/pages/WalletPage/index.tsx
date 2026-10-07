import { useEffect, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuArrowUpDown, LuCheck, LuInfo, LuPlus, LuWallet } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { WalletCard } from "@/layouts/wallet/WalletCard";
import { AddWalletCard } from "@/layouts/wallet/AddWalletCard";
import { WalletFormModal } from "@/layouts/wallet/WalletFormModal";
import { WalletReorderItem } from "@/layouts/wallet/WalletReorderItem";
import { WalletSummaryCard } from "@/layouts/wallet/WalletSummaryCard";
import { ViewModeToggle } from "@/layouts/wallet/ViewModeToggle";
import { useWallets } from "@/hooks/use-wallets";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useWalletViewMode } from "@/hooks/use-wallet-view-mode";
import { useToast } from "@/hooks/use-toast";
import type { WalletAccount, WalletInput } from "@/types/wallet.types";

const EASE = [0.22, 1, 0.36, 1] as const;

function moveItem(list: WalletAccount[], draggedId: string, targetId: string): WalletAccount[] {
  const fromIndex = list.findIndex((item) => item.idWallet === draggedId);
  const toIndex = list.findIndex((item) => item.idWallet === targetId);
  if (fromIndex === -1 || toIndex === -1) return list;

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function moveBy(list: WalletAccount[], id: string, delta: number): WalletAccount[] {
  const fromIndex = list.findIndex((item) => item.idWallet === id);
  const toIndex = fromIndex + delta;
  if (fromIndex === -1 || toIndex < 0 || toIndex >= list.length) return list;
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (status === "idle") void loadWallets();
  }, [status, loadWallets]);

  const positiveTotal = wallets.reduce((sum, wallet) => sum + Math.max(0, wallet.balance), 0);
  const shareOf = (wallet: WalletAccount) =>
    positiveTotal > 0 ? (Math.max(0, wallet.balance) / positiveTotal) * 100 : 0;
  const isInitialLoading = status !== "loaded" && wallets.length === 0;
  const isEmpty = status === "loaded" && wallets.length === 0;

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
    const wallet = wallets.find((item) => item.idWallet === id);
    const confirmed = await confirm({
      title: t("wallet.deleteConfirmTitle", { name: wallet?.nameWallet ?? "" }),
      description: t("wallet.deleteConfirmDescription"),
      confirmLabel: t("wallet.deleteWalletAction"),
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
    setActiveId(null);
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

  function handleMove(id: string, delta: number) {
    setLocalOrder((prev) => moveBy(prev, id, delta));
    setActiveId(id);
  }

  const subtitle = isReordering
    ? t("wallet.reorderSubtitle")
    : isEmpty
      ? t("wallet.emptySubtitle")
      : t("wallet.pageSubtitle", { count: wallets.length });

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("nav.wallet")}
        subtitle={subtitle}
        showSubtitleOnMobile={false}
        actions={
          isReordering ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelReorder}
                disabled={isSavingOrder}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                leftIcon={<LuCheck />}
                onClick={() => void handleSaveOrder()}
                isLoading={isSavingOrder}
              >
                {t("wallet.saveOrder")}
              </Button>
            </>
          ) : (
            <>
              {!isEmpty && <ViewModeToggle value={viewMode} onChange={setViewMode} />}
              {wallets.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<LuArrowUpDown />}
                  onClick={handleEnterReorder}
                >
                  {t("wallet.toggleReorder")}
                </Button>
              )}
              <Button type="button" leftIcon={<LuPlus />} onClick={openCreateModal}>
                {t("wallet.addTitle")}
              </Button>
            </>
          )
        }
        mobileActions={
          isReordering ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancelReorder}
                disabled={isSavingOrder}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                leftIcon={<LuCheck />}
                onClick={() => void handleSaveOrder()}
                isLoading={isSavingOrder}
              >
                {t("wallet.saveShort")}
              </Button>
            </>
          ) : (
            !isEmpty && (
              <>
                <ViewModeToggle value={viewMode} onChange={setViewMode} variant="icon" />
                {wallets.length > 1 && (
                  <IconButton
                    label={t("wallet.toggleReorder")}
                    icon={<LuArrowUpDown />}
                    variant="surface"
                    size="lg"
                    tooltip={false}
                    onClick={handleEnterReorder}
                  />
                )}
              </>
            )
          )
        }
      />

      <AnimatePresence mode="wait" initial={false}>
        {isReordering ? (
          <m.div
            key="reorder"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex flex-col gap-2 lg:rounded-card lg:bg-surface lg:p-4 lg:shadow-card"
          >
            <p className="flex items-center gap-2 rounded-control bg-primary-soft px-3.5 py-2.5 text-[12.5px] text-primary-text lg:mb-1 lg:bg-transparent lg:px-1 lg:py-1 lg:text-[13px] lg:text-text-2">
              <LuInfo className="size-4 shrink-0 lg:text-primary-text" />
              <span className="lg:hidden">{t("wallet.reorderHintShort")}</span>
              <span className="hidden lg:inline">{t("wallet.reorderHint")}</span>
            </p>
            {localOrder.map((wallet, index) => (
              <WalletReorderItem
                key={wallet.idWallet}
                wallet={wallet}
                isDragging={draggedId === wallet.idWallet}
                isActive={activeId === wallet.idWallet}
                canMoveUp={index > 0}
                canMoveDown={index < localOrder.length - 1}
                onMoveUp={() => handleMove(wallet.idWallet, -1)}
                onMoveDown={() => handleMove(wallet.idWallet, 1)}
                onDragStart={() => {
                  setDraggedId(wallet.idWallet);
                  setActiveId(wallet.idWallet);
                }}
                onDragOver={(event) => handleDragOver(event, wallet.idWallet)}
                onDrop={(event) => event.preventDefault()}
                onDragEnd={() => setDraggedId(null)}
              />
            ))}
          </m.div>
        ) : isEmpty ? (
          <m.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <EmptyState
              variant="page"
              icon={<LuWallet />}
              title={t("wallet.emptyTitle")}
              description={t("wallet.emptyDescription")}
              action={
                <Button type="button" leftIcon={<LuPlus />} onClick={openCreateModal}>
                  {t("wallet.addFirst")}
                </Button>
              }
              className="min-h-[360px] lg:min-h-[520px]"
            />
          </m.div>
        ) : (
          <m.div
            key={`view-${viewMode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex flex-col gap-4 lg:gap-5"
          >
            <Reveal immediate>
              <WalletSummaryCard wallets={wallets} isLoading={isInitialLoading} />
            </Reveal>

            {isInitialLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-[150px] rounded-card lg:h-[171px]" />
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3">
                {wallets.map((wallet, index) => (
                  <Reveal key={wallet.idWallet} delay={Math.min(index, 6) * 0.04}>
                    <WalletCard
                      wallet={wallet}
                      share={shareOf(wallet)}
                      onClick={() => openEditModal(wallet)}
                    />
                  </Reveal>
                ))}
                <Reveal delay={Math.min(wallets.length, 6) * 0.04}>
                  <AddWalletCard onClick={openCreateModal} />
                </Reveal>
              </div>
            ) : (
              <Reveal>
                <Card padding="none" className="flex flex-col px-4 py-1.5 sm:px-5 lg:px-6 lg:py-2">
                  <div className="flex flex-col divide-y divide-border">
                    {wallets.map((wallet) => (
                      <WalletCard
                        key={wallet.idWallet}
                        wallet={wallet}
                        share={shareOf(wallet)}
                        variant="row"
                        onClick={() => openEditModal(wallet)}
                      />
                    ))}
                  </div>
                  <AddWalletCard onClick={openCreateModal} variant="row" />
                </Card>
              </Reveal>
            )}
          </m.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
