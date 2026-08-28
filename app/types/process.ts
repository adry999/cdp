/**
 * Structural definition of the homepage "Process" section (section 03,
 * HomeProcess.vue): a dual-track delivery model with two pipelines shown
 * behind a toggle —
 *
 *   fast  — Fast-Track: Express builds and design-to-code.
 *   deep  — Deep Build: custom apps, refactoring and AI automations.
 *
 * ALL copy — the track badge, name, scope line, summary and every step's
 * title + body — lives in ONE place:
 *
 *     i18n/locales/{ro,en}.json  →  home.process.tracks.<id>
 *
 * Edit or add entries there. This file only owns track order + the badge tone
 * (mapped to existing theme tokens — no new colours). See useProcessTracks()
 * for how the two are joined.
 *
 * The DB `process_steps` table and /admin still exist but no longer feed this
 * section (same split as the services timeline and the stack grid).
 */
export type ProcessTrackId = 'fast' | 'deep'

/** Badge / accent tone — resolves to an existing theme token, never a new one. */
export type ProcessTrackTone = 'signal' | 'ink'

export interface ProcessTrackDef {
  /** Keys the i18n copy, the toggle button and the panel. */
  id: ProcessTrackId
  /** `signal` → orange accent (Fast-Track); `ink` → dark accent (Deep Build). */
  tone: ProcessTrackTone
}

/** One numbered step within a track. */
export interface ProcessStep {
  /** Zero-padded position, e.g. "01". */
  index: string
  title: string
  body: string
}

/** A track with its `home.process.tracks.<id>` copy resolved. */
export interface ProcessTrack extends ProcessTrackDef {
  /** Short toggle label, e.g. "Fast-Track". */
  badge: string
  /** Track name, e.g. "Express & Design-to-Code". */
  name: string
  /** Scope + duration range, e.g. "2–3 days – 3 weeks". */
  scope: string
  /** One-line description shown under the track header. */
  summary: string
  /** Ordered pipeline steps. */
  steps: ProcessStep[]
}

/** Lightest engagement first, matching the services timeline's ordering. */
export const PROCESS_TRACK_DEFS: readonly ProcessTrackDef[] = [
  { id: 'fast', tone: 'signal' },
  { id: 'deep', tone: 'ink' },
] as const
