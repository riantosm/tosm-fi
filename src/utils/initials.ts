/** "Andi Nugraha" → "AN", "Andi" → "AN", "Obligasi (SBN)" → "OS" (punctuation ignored). */
export function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0];
  const second = parts.length > 1 ? parts[parts.length - 1][0] : (first[1] ?? "");
  return (first[0] + second).toUpperCase();
}
