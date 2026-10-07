import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuPlus } from "react-icons/lu";
import { SubCategoryPill } from "@/layouts/category/SubCategoryPill";
import type { Category, SubCategory } from "@/types/category.types";

interface SubCategoryPillsProps {
  category: Category;
  onEditSubCategory: (subCategory: SubCategory) => void;
  onAddSubCategory: () => void;
  /** "+N" opens the full list (the category editor). */
  onShowAll: () => void;
}

const GAP = 8;
const MORE_WIDTH = 44;

/**
 * One line of subcategory pills: as many as fit, then "+N", then "+ Sub".
 * Pills never wrap or overflow — widths are measured on a hidden copy.
 */
export function SubCategoryPills({
  category,
  onEditSubCategory,
  onAddSubCategory,
  onShowAll,
}: SubCategoryPillsProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const subs = category.subCategories;
  const [visibleCount, setVisibleCount] = useState(subs.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    function recompute() {
      if (!container || !measure) return;
      const widths = Array.from(measure.children).map(
        (child) => (child as HTMLElement).offsetWidth,
      );
      const addWidth = (addRef.current?.offsetWidth ?? 0) + GAP;
      const available = container.clientWidth - addWidth;
      let used = 0;
      let count = 0;
      for (let index = 0; index < widths.length; index++) {
        const remainingAfter = widths.length - index - 1;
        const next = used + widths[index] + (index > 0 ? GAP : 0);
        const reserve = remainingAfter > 0 ? MORE_WIDTH + GAP : 0;
        if (next + reserve > available) break;
        used = next;
        count++;
      }
      setVisibleCount(count);
    }

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => observer.disconnect();
  }, [subs]);

  const hidden = subs.length - visibleCount;

  return (
    <div ref={containerRef} className="relative flex min-w-0 items-center gap-2 overflow-hidden">
      {/* Hidden measuring copy */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 flex gap-2"
      >
        {subs.map((sub) => (
          <SubCategoryPill
            key={sub.idSubCategory}
            subCategory={sub}
            categoryColor={category.color}
            onClick={() => {}}
            tabIndex={-1}
          />
        ))}
      </div>

      {subs.slice(0, visibleCount).map((sub) => (
        <SubCategoryPill
          key={sub.idSubCategory}
          subCategory={sub}
          categoryColor={category.color}
          onClick={() => onEditSubCategory(sub)}
        />
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={onShowAll}
          className="pressable flex h-8 shrink-0 items-center rounded-full bg-surface-2 px-2.5 text-[12.5px] font-semibold text-text-2 hover:bg-surface-3"
        >
          +{hidden}
        </button>
      )}
      <button
        ref={addRef}
        type="button"
        onClick={onAddSubCategory}
        aria-label={t("category.addSubCategory")}
        className="pressable flex h-8 shrink-0 items-center gap-1 rounded-full border border-border px-2.5 text-[13px] font-medium text-text-3 hover:border-border-strong hover:text-text sm:px-3"
      >
        <LuPlus className="size-3.5" />
        <span className="hidden sm:inline">{t("category.subShort")}</span>
      </button>
    </div>
  );
}
