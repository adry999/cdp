const ADMIN_TIME_ZONE = 'Europe/Chisinau'

const dateFormat = new Intl.DateTimeFormat('ro-RO', { timeZone: ADMIN_TIME_ZONE })
const dateTimeFormat = new Intl.DateTimeFormat('ro-RO', {
  timeZone: ADMIN_TIME_ZONE,
  dateStyle: 'short',
  timeStyle: 'medium',
})

/**
 * Admin dates in a fixed zone: without one the server and the browser format the same instant
 * differently and Vue reports a hydration mismatch.
 */
export function formatAdminDate(iso: string, options: { withTime?: boolean } = {}): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return (options.withTime ? dateTimeFormat : dateFormat).format(date)
}
