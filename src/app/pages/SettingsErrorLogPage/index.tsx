import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Words } from "@/components/atoms/Words";
import { IconLoader } from "@/components/atoms/IconLoader";
import { Input } from "@/components/atoms/Input";
import { useAuth } from "@/hooks/use-auth";
import { useClientErrors } from "@/hooks/use-client-errors";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import type { ClientErrorEnvironment } from "@/types/client-error.types";

const SEARCH_DEBOUNCE_MS = 400;
const ENVIRONMENT_FILTERS = ["all", "development", "production"] as const;
type EnvironmentFilter = (typeof ENVIRONMENT_FILTERS)[number];

const ENVIRONMENT_BADGE_CLASS: Record<ClientErrorEnvironment, string> = {
  production: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  development: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
};

export function SettingsErrorLogPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { errors, status, loadClientErrors, deleteClientError } = useClientErrors();
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState<EnvironmentFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // GET /errors has a server-side side effect (flips isRead) — a plain
  // effect would fire it twice under StrictMode's dev-only double-invoke,
  // which would mark genuinely-new errors as already-read before the "Baru"
  // badge ever gets a chance to render. Guards against firing the exact same
  // query twice in a row; a real filter change still refetches normally.
  const requestedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (user.role !== "admin") return;
    const params = {
      search: debouncedSearch || undefined,
      environment: environmentFilter !== "all" ? environmentFilter : undefined,
    };
    const key = JSON.stringify(params);
    if (requestedKeyRef.current === key) return;
    requestedKeyRef.current = key;
    void loadClientErrors(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, environmentFilter]);

  if (user.role !== "admin") {
    return <Navigate to={ROUTES.SETTINGS} replace />;
  }

  const hasActiveFilter = environmentFilter !== "all" || Boolean(debouncedSearch);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  async function handleDelete(idClientError: string) {
    const confirmed = await confirm({
      title: t("errorLog.deleteConfirmTitle"),
      description: t("errorLog.deleteConfirmDescription"),
      confirmLabel: t("errorLog.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(idClientError);
    try {
      await deleteClientError(idClientError);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("errorLog.genericError"), "error");
    } finally {
      setDeletingId(null);
    }
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            startIcon={<HiOutlineMagnifyingGlass className="h-4 w-4" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("errorLog.searchPlaceholder")}
            className="sm:max-w-xs"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ENVIRONMENT_FILTERS.map((filter) => {
              const isActive = environmentFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setEnvironmentFilter(filter)}
                  className={cn(
                    "shrink-0 rounded-full border-2 px-3.5 py-1.5 transition-colors",
                    isActive
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                      : "border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800",
                  )}
                >
                  <Words type="xs/bold" as="span" className="whitespace-nowrap text-ink-800 dark:text-ink-200">
                    {filter === "all" ? t("common.all") : t(`errorLog.environment.${filter}`)}
                  </Words>
                </button>
              );
            })}
          </div>
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center py-12">
            <IconLoader className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        )}

        {status === "loaded" && errors.length === 0 && (
          <Words type="sm/regular" className="text-ink-400 dark:text-ink-500">
            {hasActiveFilter ? t("errorLog.emptyFiltered") : t("errorLog.empty")}
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
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {!item.isRead && (
                        <span className="inline-flex shrink-0 items-center rounded-md bg-primary-50 px-1.5 py-0.5 dark:bg-primary-500/10">
                          <Words type="xxs/bold" as="span" className="text-primary-700 dark:text-primary-400">
                            {t("errorLog.newBadge")}
                          </Words>
                        </span>
                      )}
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5",
                          ENVIRONMENT_BADGE_CLASS[item.environment],
                        )}
                      >
                        <Words type="xxs/bold" as="span">
                          {t(`errorLog.environment.${item.environment}`)}
                        </Words>
                      </span>
                      <Words type="sm/bold" as="span" className="text-red-600 dark:text-red-400">
                        {item.message}
                      </Words>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                        {formatDate(item.createdAt)}
                      </Words>
                      <button
                        type="button"
                        aria-label={t("errorLog.deleteButton")}
                        disabled={deletingId === item.idClientError}
                        onClick={() => void handleDelete(item.idClientError)}
                        className="text-ink-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-ink-500 dark:hover:text-red-400"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <Words type="xs/regular" as="span" className="text-ink-400 dark:text-ink-500">
                    {item.source} · {item.path ?? "-"}
                    {item.username ? ` · @${item.username}` : ""}
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
