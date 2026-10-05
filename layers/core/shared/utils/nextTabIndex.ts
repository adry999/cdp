/**
 * Index to focus after an arrow-key press in a roving-tabindex tablist, or null when
 * the key is not a navigation key. `horizontalOnly` also drops Up/Down and Home/End.
 */
export function nextTabIndex(key: string, current: number, count: number, horizontalOnly = false): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count
    case 'ArrowLeft':
      return (current - 1 + count) % count
    case 'ArrowDown':
      return horizontalOnly ? null : (current + 1) % count
    case 'ArrowUp':
      return horizontalOnly ? null : (current - 1 + count) % count
    case 'Home':
      return horizontalOnly ? null : 0
    case 'End':
      return horizontalOnly ? null : count - 1
    default:
      return null
  }
}
