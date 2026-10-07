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

/** Moves the item at `index` by `delta` places (arrow-button reorder); out-of-range moves are no-ops. */
export function moveByIndex<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}
