import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge that knows the Mist theme tokens from `src/css/index.css`. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["card", "control", "sheet"],
      shadow: ["card", "card-hover", "pop", "float"],
      animate: ["fade-in", "fade-up", "scale-in", "shimmer", "typing"],
    },
  },
});

/** Joins class names and lets later Tailwind classes win over earlier conflicting ones (`className` overrides). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
