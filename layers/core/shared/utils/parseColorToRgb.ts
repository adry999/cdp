/** Reads `#rgb`, `#rrggbb`, `rgb(r, g, b)` or `rgba(r, g, b, a)` into `[r, g, b]`; null when unsupported. */
export function parseColorToRgb(value: string): [number, number, number] | null {
  const input = value.trim().toLowerCase()

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(input)
  if (hex) {
    const digits = hex[1]!.length === 3 ? hex[1]!.replace(/./g, (c) => c + c) : hex[1]!
    return [
      parseInt(digits.slice(0, 2), 16),
      parseInt(digits.slice(2, 4), 16),
      parseInt(digits.slice(4, 6), 16),
    ]
  }

  const fn = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+[\d.]+%?)?\s*\)$/.exec(input)
  if (fn) {
    const [r, g, b] = [Number(fn[1]), Number(fn[2]), Number(fn[3])] as [number, number, number]
    if (r <= 255 && g <= 255 && b <= 255) return [r, g, b]
  }

  return null
}
