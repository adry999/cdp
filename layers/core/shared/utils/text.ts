export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function clipText(value: string | undefined, maxLength: number): string {
  return (value ?? '').trim().slice(0, maxLength)
}
