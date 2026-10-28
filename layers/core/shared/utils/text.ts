export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Request bodies are parsed JSON, so a field may be any type; only text counts, the rest is "missing".
export function clipText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

// Single-line fields end up in an email subject: CR/LF would let a visitor inject headers.
export function clipLine(value: unknown, maxLength: number): string {
  return clipText(typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ') : value, maxLength)
}

// "label →" where the arrow may never wrap onto a line of its own: a no-break space ties it to the last word.
export function withArrow(label: string): string {
  return `${label.trimEnd()}\u00a0→`
}
