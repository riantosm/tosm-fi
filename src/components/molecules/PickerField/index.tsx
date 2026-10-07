import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";

interface PickerFieldProps {
  id?: string;
  label?: string;
  icon: ReactNode;
  value: ReactNode;
  onClick: () => void;
}

/** Labelled select-style trigger (V2/Field with a chevron) that opens a picker dialog. */
export function PickerField({ id, label, icon, value, onClick }: PickerFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-text-2">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        onClick={onClick}
        className="group flex h-12 w-full items-center gap-2.5 rounded-control bg-surface-2 px-4 text-left transition-colors duration-200 hover:bg-surface-3"
      >
        <span className="flex shrink-0 text-text-3 [&_svg]:size-[18px]">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-[14px] text-text">{value}</span>
        <LuChevronDown className="size-[18px] shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-y-px" />
      </button>
    </div>
  );
}
