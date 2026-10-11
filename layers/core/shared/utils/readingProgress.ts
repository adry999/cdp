/** Share of the page scrolled, `0`–`1`; `0` when the page fits the viewport. */
export function readingProgress(scrollY: number, scrollHeight: number, viewportHeight: number): number {
  const scrollable = scrollHeight - viewportHeight
  if (scrollable <= 0) return 0
  return Math.min(1, Math.max(0, scrollY / scrollable))
}
