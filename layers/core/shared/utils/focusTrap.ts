/**
 * The element a Tab press should move to inside a focus trap, or null to let
 * the browser move focus. Shift+Tab from outside the container also wraps to
 * the last element: focus can still sit on the page behind a dialog that has
 * just opened.
 */
export function focusTrapTarget<T>(
  items: readonly T[],
  active: T | null,
  backwards: boolean,
  activeInside: boolean,
): T | null {
  const first = items[0]
  const last = items.at(-1)
  if (first === undefined || last === undefined) return null
  if (backwards) return active === first || !activeInside ? last : null
  return active === last ? first : null
}
