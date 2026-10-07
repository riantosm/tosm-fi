import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "motion/react";
import { LuBug, LuChevronDown, LuTrash2 } from "react-icons/lu";
import { Reveal } from "@/components/atoms/Reveal";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Card } from "@/components/molecules/Card";
import { Chip } from "@/components/molecules/Chip";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TransactionSearchField } from "@/layouts/transaction/TransactionToolbar";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useClientErrors } from "@/hooks/use-client-errors";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/utils/cn";
import { toIntlLocale } from "@/utils/locale";
import type { ClientError, ClientErrorEnvironment } from "@/types/client-error.types";

const SEARCH_DEBOUNCE_MS = 400;
const ENVIRONMENT_FILTERS = ["all", "development", "production"] as const;
type EnvironmentFilter = (typeof ENVIRONMENT_FILTERS)[number];

const ENVIRONMENT_BADGE_CLASS: Record<ClientErrorEnvironment, string> = {
  production: "bg-expense-soft text-expense-text",
  development: "bg-investment-soft text-investment-text",
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function SettingsErrorLogPage() {
  const { t } = useTranslation();
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
  const isInitialLoading = status !== "loaded" && errors.length === 0;

  async function handleDelete(idClientError: string) {
    const confirmed = await confirm({
      title: t("errorLog.deleteConfirmTitle"),
      description: t("errorLog.deleteConfirmDescription"),
      confirmLabel: t("errorLog.deleteConfirmAction"),
      cancelLabel: t("common.cancel"),
      destructive: true,
      icon: LuTrash2,
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
    <div className="flex flex-col gap-4 lg:gap-5">
      <PageHeader
        title={t("errorLog.title")}
        subtitle={t("errorLog.subtitle")}
        backTo={ROUTES.SETTINGS}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <TransactionSearchField
          value={search}
          onChange={setSearch}
          placeholder={t("errorLog.searchPlaceholder")}
          className="lg:w-[420px]"
        />
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 scrollbar-hide">
          {ENVIRONMENT_FILTERS.map((filter) => (
            <Chip
              key={filter}
              size="sm"
              surface="page"
              active={environmentFilter === filter}
              onClick={() => setEnvironmentFilter(filter)}
            >
              {filter === "all" ? t("common.all") : t(`errorLog.environment.${filter}`)}
            </Chip>
          ))}
        </div>
      </div>

      {isInitialLoading ? (
        <div className="flex flex-col gap-3 lg:gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-[132px] rounded-card" />
          ))}
        </div>
      ) : errors.length === 0 ? (
        <EmptyState
          variant="page"
          icon={<LuBug />}
          title={hasActiveFilter ? t("errorLog.emptyFiltered") : t("errorLog.empty")}
          className="min-h-[320px]"
        />
      ) : (
        <div
          className={cn(
            "flex flex-col gap-3 transition-opacity duration-300 lg:gap-4",
            status === "loading" && "opacity-60",
          )}
        >
          {errors.map((item, index) => (
            <Reveal key={item.idClientError} delay={Math.min(index, 6) * 0.03}>
              <ErrorLogCard
                item={item}
                defaultExpanded={index === 0}
                isDeleting={deletingId === item.idClientError}
                onDelete={() => void handleDelete(item.idClientError)}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

interface ErrorLogCardProps {
  item: ClientError;
  defaultExpanded: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}

function ErrorLogCard({ item, defaultExpanded, isDeleting, onDelete }: ErrorLogCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isStackOpen, setIsStackOpen] = useState(defaultExpanded);

  const date = new Intl.DateTimeFormat(toIntlLocale(language), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(item.createdAt));
  const meta = [item.source, item.path, item.username ? `@${item.username}` : null, date]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!item.isRead && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11.5px] font-semibold text-primary-fg">
              {t("errorLog.newBadge")}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold",
              ENVIRONMENT_BADGE_CLASS[item.environment],
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {t(`errorLog.environment.${item.environment}`)}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={t("errorLog.deleteButton")}
          className="pressable flex size-8 shrink-0 items-center justify-center gap-1.5 rounded-full bg-surface-2 text-[12.5px] font-semibold text-expense-text transition-colors hover:bg-expense-soft disabled:opacity-60 lg:w-auto lg:px-3"
        >
          <LuTrash2 className="size-3.5" />
          <span className="hidden lg:inline">{t("errorLog.deleteButton")}</span>
        </button>
      </div>

      <p className="font-mono text-[13px] leading-relaxed font-semibold break-words text-expense-text lg:text-[13.5px]">
        {item.message}
      </p>
      <p className="truncate text-[12.5px] text-text-3">{meta}</p>

      {item.stack && (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {isStackOpen && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <pre className="max-h-64 overflow-auto rounded-[16px] bg-code-bg p-4 font-mono text-[12px] leading-[1.65] text-code-fg">
                  {item.stack}
                </pre>
              </m.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setIsStackOpen((open) => !open)}
            aria-expanded={isStackOpen}
            className="flex w-fit items-center gap-1.5 text-[13px] font-semibold text-primary-text"
          >
            <LuChevronDown
              className={cn(
                "size-4 transition-transform duration-300",
                isStackOpen && "rotate-180",
              )}
            />
            {isStackOpen ? t("errorLog.hideStack") : t("errorLog.showStack")}
          </button>
        </div>
      )}
    </Card>
  );
}
