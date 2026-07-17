import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { IconLoader } from "@/components/atoms/IconLoader";
import { useAuth } from "@/hooks/use-auth";
import { useClientErrors } from "@/hooks/use-client-errors";
import { ROUTES } from "@/constants/routes";

export function SettingsErrorLogPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { errors, status, loadClientErrors } = useClientErrors();

  useEffect(() => {
    if (user.role !== "admin") return;
    void loadClientErrors();
    // Only ever needs to run once per page visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user.role !== "admin") {
    return <Navigate to={ROUTES.SETTINGS} replace />;
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
            {t("errorLog.title")}
          </Words>
          <Words type="sm/regular" className="text-ink-500 dark:text-ink-400">
            {t("errorLog.subtitle")}
          </Words>
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center py-12">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}

        {status === "loaded" && errors.length === 0 && (
          <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
            {t("errorLog.empty")}
          </Words>
        )}

        {status === "loaded" && errors.length > 0 && (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {errors.map((item) => (
                <div
                  key={item.idClientError}
                  className="flex flex-col gap-1.5 bg-white px-4 py-3 dark:bg-ink-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Words type="sm/bold" as="span" className="text-red-600 dark:text-red-400">
                      {item.message}
                    </Words>
                    <Words
                      type="xs/regular"
                      as="span"
                      className="shrink-0 text-ink-400 dark:text-ink-500"
                    >
                      {formatDate(item.createdAt)}
                    </Words>
                  </div>
                  <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                    {item.source} · {item.path ?? "-"}
                    {item.idUser ? ` · ${item.idUser}` : ""}
                  </Words>
                  {item.stack && (
                    <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-ink-50 p-2 text-[11px] text-ink-600 dark:bg-ink-950 dark:text-ink-400">
                      {item.stack}
                    </pre>
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
