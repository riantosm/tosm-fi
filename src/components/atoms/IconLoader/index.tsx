import type { SVGProps } from "react";

export function IconLoader(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      {...props}
    >
      <path d="M12 2v4" opacity={0.9} />
      <path d="M12 18v4" opacity={0.2} />
      <path d="M4.9 4.9l2.8 2.8" opacity={0.3} />
      <path d="M16.3 16.3l2.8 2.8" opacity={0.6} />
      <path d="M2 12h4" opacity={0.4} />
      <path d="M18 12h4" opacity={0.7} />
      <path d="M4.9 19.1l2.8-2.8" opacity={0.5} />
      <path d="M16.3 7.7l2.8-2.8" opacity={0.8} />
    </svg>
  );
}
