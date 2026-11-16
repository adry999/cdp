const MAX_INSET = 90

/**
 * Where the interactive background's lens rests while no pointer is over it: the top-right corner of its
 * box, clear of the heading and text, which start at the left. The inset grows with the width up to 90px.
 */
export function backgroundRestPoint(width: number, height: number): { x: number; y: number } {
  const inset = Math.min(width * 0.06, height * 0.5, MAX_INSET)
  return { x: width - inset, y: inset }
}
