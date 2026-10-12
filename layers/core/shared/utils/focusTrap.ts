// The element a Tab press should move to inside a focus trap, or null to let the browser
// handle it. Focus outside the container (it falls to <body> when the focused control is removed)
// re-enters at the first element on Tab and at the last on Shift+Tab.
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
  return active === last || !activeInside ? first : null
}
