import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Button } from "@/components/atoms/Button";
import { Words } from "@/components/atoms/Words";
import { IconLoader } from "@/components/atoms/IconLoader";
import { useAuth } from "@/hooks/use-auth";
import { useUserApproval } from "@/hooks/use-user-approval";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export function SettingsUserApprovalPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { users, status, loadUsers, acceptUser } = useUserApproval();
  const { showToast } = useToast();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user.role !== "admin") return;
    void loadUsers();
    // Only ever needs to run once per page visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user.role !== "admin") {
    return <Navigate to={ROUTES.SETTINGS} replace />;
  }

  async function handleActivate(idUser: string) {
    setActivatingId(idUser);
    try {
      await acceptUser(idUser);
      showToast(t("userApproval.activateSuccess"), "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("userApproval.genericError"), "error");
    } finally {
      setActivatingId(null);
    }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            to={ROUTES.SETTINGS}
            className="flex w-fit items-center gap-1.5 text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            <Words type="sm/bold" as="span">
              {t("common.back")}
            </Words>
          </Link>
          <Words as="h1" type="2xl/bold" className="text-ink-900 dark:text-ink-50">
            {t("userApproval.title")}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("userApproval.subtitle")}
          </Words>
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center py-12">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}

        {status === "loaded" && users.length === 0 && (
          <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
            {t("userApproval.empty")}
          </Words>
        )}

        {status === "loaded" && users.length > 0 && (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {users.map((item) => (
                <div
                  key={item.idUser}
                  className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-ink-900"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Words type="sm/bold" as="span" className="text-ink-800 dark:text-ink-200">
                      {item.nameUser}
                    </Words>
                    <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                      @{item.username} · {t("userApproval.registeredAt", {
                        date: formatDate(item.createdAt),
                      })}
                    </Words>
                  </div>

                  {item.status === "active" ? (
                    <span
                      className={cn(
                        "inline-flex w-fit shrink-0 items-center gap-1 rounded-md px-2 py-1",
                        "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
                      )}
                    >
                      <HiOutlineCheck className="h-3.5 w-3.5" />
                      <Words type="xs/bold" as="span">
                        {t("userApproval.statusActive")}
                      </Words>
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      isLoading={activatingId === item.idUser}
                      onClick={() => void handleActivate(item.idUser)}
                      className="shrink-0"
                    >
                      <Words type="sm/bold" as="span">
                        {t("userApproval.activateButton")}
                      </Words>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
