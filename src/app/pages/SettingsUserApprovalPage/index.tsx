import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuCrown, LuShieldCheck, LuSparkles, LuUserPlus, LuUsers } from "react-icons/lu";
import { Button } from "@/components/atoms/Button";
import { Monogram } from "@/components/atoms/Monogram";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { WALLET_COLOR_PRESETS } from "@/constants/wallet-colors";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useUserApproval } from "@/hooks/use-user-approval";
import type { AuthUser, UserPlan } from "@/types/auth.types";
import { toIntlLocale } from "@/utils/locale";

/** Stable avatar color per username so the list doesn't reshuffle colors between visits. */
function colorFor(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return WALLET_COLOR_PRESETS[hash % WALLET_COLOR_PRESETS.length];
}

export function SettingsUserApprovalPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { users, status, loadUsers, setUserPlan } = useUserApproval();
  const { showToast } = useToast();
  const { confirm } = useConfirmDialog();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user.role !== "admin") return;
    void loadUsers();
    // Only ever needs to run once per page visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Free accounts first (the ones an admin may upgrade), newest first within each group.
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => Number(isPro(a)) - Number(isPro(b))),
    [users],
  );

  if (user.role !== "admin") {
    return <Navigate to={ROUTES.SETTINGS} replace />;
  }

  const proCount = users.filter(isPro).length;
  const freeCount = users.length - proCount;
  const isInitialLoading = status !== "loaded" && users.length === 0;

  async function handleChangePlan(item: AuthUser, plan: UserPlan) {
    const toPro = plan === "pro";
    const confirmed = await confirm({
      title: t(toPro ? "userApproval.makeProConfirmTitle" : "userApproval.makeFreeConfirmTitle"),
      description: t(
        toPro
          ? "userApproval.makeProConfirmDescription"
          : "userApproval.makeFreeConfirmDescription",
        { name: item.nameUser },
      ),
      confirmLabel: t(toPro ? "userApproval.makePro" : "userApproval.makeFree"),
      cancelLabel: t("common.cancel"),
      destructive: !toPro,
      icon: toPro ? LuSparkles : LuUsers,
    });
    if (!confirmed) return;

    setUpdatingId(item.idUser);
    try {
      await setUserPlan(item.idUser, plan);
      showToast(
        t(toPro ? "userApproval.makeProSuccess" : "userApproval.makeFreeSuccess", {
          name: item.nameUser,
        }),
        "success",
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("userApproval.genericError"), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(toIntlLocale(language), {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("userApproval.title")}
        subtitle={t("userApproval.subtitle")}
        backTo={ROUTES.SETTINGS}
      />

      <Reveal immediate className="grid grid-cols-2 gap-3 lg:gap-5">
        <CountCard
          icon={<LuUsers />}
          tileClassName="bg-surface-2 text-text-2"
          value={freeCount}
          label={t("userApproval.freeLabel")}
          isLoading={isInitialLoading}
        />
        <CountCard
          icon={<LuCrown />}
          tileClassName="bg-primary-soft text-primary-text"
          value={proCount}
          label={t("userApproval.proLabel")}
          isLoading={isInitialLoading}
        />
      </Reveal>

      <Reveal delay={0.05}>
        <Card padding="none" className="px-4 py-1 lg:px-6 lg:py-2">
          {isInitialLoading ? (
            <div className="flex flex-col gap-3 py-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="size-11 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-1/3 rounded-full" />
                    <Skeleton className="h-3 w-1/2 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState icon={<LuUserPlus />} title={t("userApproval.empty")} className="my-4" />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {sortedUsers.map((item) => (
                <div
                  key={item.idUser}
                  className="flex animate-fade-in items-center gap-3 py-3.5 lg:gap-3.5"
                >
                  <Monogram
                    name={item.nameUser}
                    color={colorFor(item.username)}
                    size="lg"
                    className="size-11"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[14.5px] font-semibold text-text">
                      {item.nameUser}
                    </span>
                    <span className="truncate text-[12.5px] text-text-3">
                      @{item.username} ·{" "}
                      {t("userApproval.registeredAt", { date: formatDate(item.createdAt) })}
                    </span>
                  </span>
                  <PlanBadge user={item} />
                  {item.role !== "admin" && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isPro(item) ? "ghost" : "soft"}
                      leftIcon={isPro(item) ? undefined : <LuSparkles />}
                      isLoading={updatingId === item.idUser}
                      disabled={updatingId !== null}
                      onClick={() => void handleChangePlan(item, isPro(item) ? "free" : "pro")}
                      className="shrink-0"
                    >
                      {t(isPro(item) ? "userApproval.makeFree" : "userApproval.makePro")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}

const isPro = (user: AuthUser) => user.plan === "pro";

function PlanBadge({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  if (user.role === "admin") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[12px] font-semibold text-primary-text">
        <LuShieldCheck className="size-3.5" />
        {t("userApproval.adminPro")}
      </span>
    );
  }
  return isPro(user) ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[12px] font-semibold text-primary-text">
      <LuCrown className="size-3.5" />
      Pro
    </span>
  ) : (
    <span className="hidden shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-semibold text-text-2 sm:inline-flex">
      Free
    </span>
  );
}

function CountCard({
  icon,
  tileClassName,
  value,
  label,
  isLoading,
}: {
  icon: ReactNode;
  tileClassName: string;
  value: number;
  label: string;
  isLoading: boolean;
}) {
  return (
    <Card padding="none" className="flex items-center gap-2.5 p-3.5 lg:gap-4 lg:p-6">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-[12px] [&_svg]:size-[18px] lg:size-10 lg:[&_svg]:size-[19px] ${tileClassName}`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        {isLoading ? (
          <Skeleton className="h-6 w-8 rounded-full" />
        ) : (
          <span className="font-num text-[22px] leading-none font-semibold text-text tabular">
            {value}
          </span>
        )}
        <span className="line-clamp-2 text-[12px] leading-tight text-text-2 lg:text-[12.5px]">
          {label}
        </span>
      </span>
    </Card>
  );
}
