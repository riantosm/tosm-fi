import type { DragEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import { LuChevronDown, LuChevronUp, LuGripVertical } from "react-icons/lu";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/utils/cn";

interface ReorderRowProps {
  /** Tile / icon before the title. */
  leading: ReactNode;
  title: ReactNode;
  /** Small line under the title (hidden on phones). */
  meta?: ReactNode;
  /** Badge next to the title. */
  badge?: ReactNode;
  /** Right-side info before the arrows (amount, type badge…). */
  trailing?: ReactNode;
  isDragging: boolean;
  /** Last moved row — outlined so the eye can follow it. */
  isActive?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

/**
 * One row of an "Atur urutan" list: drag by the grip (desktop) or use the
 * arrow buttons (any device). The outer `m.div` only animates the position;
 * HTML5 drag events live on the inner div (motion swallows `onDrag*` props).
 */
export function ReorderRow({
  leading,
  title,
  meta,
  badge,
  trailing,
  isDragging,
  isActive = false,
  canMoveUp = false,
  canMoveDown = false,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ReorderRowProps) {
  const { t } = useTranslation();

  return (
    <m.div layout transition={{ type: "spring", stiffness: 500, damping: 40 }}>
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={cn(
          "flex items-center gap-3 rounded-[16px] border-[1.5px] p-3 transition-[background-color,border-color,opacity,box-shadow] duration-200 sm:gap-3.5 sm:px-4",
          isDragging
            ? "border-primary bg-surface opacity-60 shadow-pop"
            : isActive
              ? "border-primary bg-surface shadow-card"
              : "border-transparent bg-surface shadow-card lg:bg-surface-2 lg:shadow-none",
        )}
      >
        <LuGripVertical
          className="size-[18px] shrink-0 cursor-grab text-text-3 active:cursor-grabbing"
          aria-hidden="true"
        />
        {leading}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold text-text">{title}</span>
            {badge && <span className="hidden shrink-0 sm:inline-flex">{badge}</span>}
          </span>
          {meta && (
            <span className="hidden truncate text-[12.5px] text-text-3 sm:block">{meta}</span>
          )}
        </span>
        {trailing && <span className="hidden shrink-0 md:block">{trailing}</span>}
        <span className="flex shrink-0 items-center gap-1.5">
          <IconButton
            label={t("common.moveUp")}
            icon={<LuChevronUp />}
            size="sm"
            variant="surface"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            tooltip={false}
            className="disabled:opacity-40"
          />
          <IconButton
            label={t("common.moveDown")}
            icon={<LuChevronDown />}
            size="sm"
            variant="surface"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            tooltip={false}
            className="disabled:opacity-40"
          />
        </span>
      </div>
    </m.div>
  );
}
