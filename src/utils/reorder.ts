export function moveItem<T>(
  list: T[],
  draggedId: string,
  targetId: string,
  getId: (item: T) => string,
): T[] {
  const fromIndex = list.findIndex((item) => getId(item) === draggedId);
  const toIndex = list.findIndex((item) => getId(item) === targetId);
  if (fromIndex === -1 || toIndex === -1) return list;

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
