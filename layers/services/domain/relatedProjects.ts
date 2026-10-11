import type { ServiceTagId } from '#layers/core/shared/types/service-tag'

/**
 * Which projects a service page shows. One place to change when projects get
 * several service links (`nav_services`) instead of a single `service_tag`.
 */
export function projectsForService<T extends { service_tag: string | null }>(
  rows: readonly T[],
  service: ServiceTagId,
): T[] {
  return rows.filter((row) => row.service_tag === service)
}
