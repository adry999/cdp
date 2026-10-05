/** Returns a copy of `list` with the item at `from` removed and re-inserted at index `to` of the shortened list. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list]
  if (from < 0 || from >= next.length) return next
  const [moved] = next.splice(from, 1) as [T]
  next.splice(to, 0, moved)
  return next
}
