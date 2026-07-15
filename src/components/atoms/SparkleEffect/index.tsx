interface Sparkle {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
}

// Fixed-but-scattered positions (not random per render) so the layout never
// jumps between re-renders — the twinkle itself comes from staggered
// animation-delay/duration per star, which reads as random enough.
const SPARKLES: Sparkle[] = [
  { top: "10%", left: "78%", size: 7, delay: "0s", duration: "2.2s" },
  { top: "62%", left: "88%", size: 5, delay: "0.5s", duration: "1.8s" },
  { top: "22%", left: "94%", size: 4, delay: "1.1s", duration: "2.4s" },
  { top: "75%", left: "68%", size: 6, delay: "0.8s", duration: "2s" },
  { top: "42%", left: "84%", size: 4, delay: "1.5s", duration: "2.6s" },
];

/** Small gold stars that twinkle at staggered intervals, scattered across the parent's bounds. Parent needs `relative`. */
export function SparkleEffect() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {SPARKLES.map((sparkle, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className="absolute animate-sparkle-twinkle"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
            filter: "drop-shadow(0 0 2px rgba(255, 209, 102, 0.8))",
          }}
        >
          <path
            fill="#FFD166"
            d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
          />
        </svg>
      ))}
    </div>
  );
}
