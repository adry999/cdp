// Mirrors supabase/migrations/20261118120000_leads_retention_purge.sql: a lead is deleted once 12
// months have passed since its last activity (its creation, then each change of status or notes),
// unless it is won. The database deletes it at the next new lead after that date.
export const LEAD_RETENTION_MONTHS = 12

/** The date after which the lead is deleted automatically; null for a won lead. */
export function leadPurgeDate(lead: { status: string; last_activity_at: string }): Date | null {
  if (lead.status === 'castigat') return null
  const date = new Date(lead.last_activity_at)
  if (Number.isNaN(date.getTime())) return null
  date.setUTCMonth(date.getUTCMonth() + LEAD_RETENTION_MONTHS)
  return date
}
