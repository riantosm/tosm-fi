/** A soft gold highlight band that sweeps left-to-right on loop. Parent needs `relative` + `overflow-hidden` (or its own bounds act as the clip, like a nav row). */
export function GoldShimmerEffect() {
  return (
    <div
      className="pointer-events-none absolute inset-0 animate-gold-shimmer"
      style={{
        backgroundImage:
          "linear-gradient(100deg, transparent 5%, rgba(255, 209, 102, 0.35) 50%, transparent 65%)",
        backgroundSize: "250% 100%",
      }}
    />
  );
}
