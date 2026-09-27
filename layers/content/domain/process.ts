// Structural definition of the homepage "Process" section (HomeProcess.vue): a dual-track
// delivery model. All copy lives in i18n/locales/{ro,en}.json under `home.process.tracks.<id>`;
// this file only owns track order and badge tone. The DB `process_steps` table doesn't feed it.
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
