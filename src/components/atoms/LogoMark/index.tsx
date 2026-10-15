import { useId } from "react";
import { cn } from "@/utils/cn";

interface LogoMarkProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  xs: "size-5",
  sm: "size-8",
  md: "size-[42px]",
  lg: "size-14",
};

// "TF" mark paths — same geometry as design/brand/logo-*.svg and the mobile app's LogoMark.
const T_PATH =
  "M345 345H909A78 78 0 0 1 909 501H809A144 144 0 0 0 665 645V891A71 71 0 0 1 523 891V571A70 70 0 0 0 453 501H345A78 78 0 0 1 345 345Z";
const PEACH_LEAF =
  "M809 529H977A10 10 0 0 1 987 539A145 145 0 0 1 842 684H793A128 128 0 0 0 693 732V645A116 116 0 0 1 809 529Z";
const LILAC_LEAF =
  "M793 712H910A10 10 0 0 1 920 722V735A125 125 0 0 1 795 860A128 128 0 0 0 693 911V812A100 100 0 0 1 793 712Z";
/** The stem sweeping up into the right half of the bar (drawn lighter, casting a soft fold shadow). */
const T_FRONT = "M523 615C523 470 620 352 775 345H1000V1000H500Z";

/** Brand mark — the TosmFi app icon: lilac gradient tile with the white "TF" (peach + lilac leaves). */
export function LogoMark({ size = "sm", className }: LogoMarkProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1024 1024"
      className={cn("shrink-0", SIZE_CLASS[size], className)}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C8CBFD" />
          <stop offset="0.45" stopColor="#9297F7" />
          <stop offset="1" stopColor="#5F62D6" />
        </linearGradient>
        <radialGradient id={`${id}-sheen`} cx="0.18" cy="0.12" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#EEEFFE" />
          <stop offset="1" stopColor="#C9CCF8" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCDEFB" />
        </linearGradient>
        <linearGradient id={`${id}-peach`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE6BA" />
          <stop offset="1" stopColor="#F5BC72" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBFBFF" />
          <stop offset="1" stopColor="#CDD0F7" />
        </linearGradient>
        <clipPath id={`${id}-t`}>
          <path d={T_PATH} />
        </clipPath>
        <filter id={`${id}-fold`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id={`${id}-drop`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#3A3DA6" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect width="1024" height="1024" rx="260" fill={`url(#${id}-bg)`} />
      <rect width="1024" height="1024" rx="260" fill={`url(#${id}-sheen)`} />
      <g
        filter={`url(#${id}-drop)`}
        transform="translate(512 512) scale(0.91) translate(-627 -653.5)"
      >
        <g clipPath={`url(#${id}-t)`}>
          <path d={T_PATH} fill={`url(#${id}-back)`} />
          <path
            d={T_FRONT}
            fill="#3B3EA8"
            opacity="0.28"
            filter={`url(#${id}-fold)`}
            transform="translate(-16 8)"
          />
          <path d={T_FRONT} fill={`url(#${id}-front)`} />
        </g>
        <path d={PEACH_LEAF} fill={`url(#${id}-peach)`} />
        <path d={LILAC_LEAF} fill={`url(#${id}-leaf)`} />
      </g>
    </svg>
  );
}
