import { useTranslation } from "react-i18next";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import { Words } from "@/components/atoms/Words";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SIBLING_COUNT = 1;

function buildPageList(page: number, totalPages: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [1];

  const rangeStart = Math.max(2, page - SIBLING_COUNT);
  const rangeEnd = Math.min(totalPages - 1, page + SIBLING_COUNT);

  if (rangeStart > 2) pages.push("ellipsis");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 1) pages.push("ellipsis");

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function PageButton({
  isActive,
  onClick,
  children,
}: {
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[13px] font-bold transition-colors",
        isActive
          ? "bg-primary-600 text-white dark:bg-primary-500 dark:text-ink-950"
          : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800",
      )}
    >
      {children}
    </button>
  );
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        aria-label={t("common.previous")}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-ink-300 dark:hover:bg-ink-800"
      >
        <HiOutlineChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <Words
            key={`ellipsis-${index}`}
            type="sm/regular"
            className="px-1 text-ink-400 dark:text-ink-500"
          >
            …
          </Words>
        ) : (
          <PageButton key={entry} isActive={entry === page} onClick={() => onPageChange(entry)}>
            {entry}
          </PageButton>
        ),
      )}

      <button
        type="button"
        aria-label={t("common.next")}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-ink-300 dark:hover:bg-ink-800"
      >
        <HiOutlineChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
