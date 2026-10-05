// Copy lives in i18n under `home.process.tracks.<id>`; this file owns only track order and tone.
export type ProcessTrackId = 'fast' | 'deep'

export type ProcessTrackTone = 'signal' | 'ink'

export interface ProcessTrackDef {
  id: ProcessTrackId
  tone: ProcessTrackTone
}

export interface ProcessStep {
  index: string
  title: string
  body: string
}

export interface ProcessTrack extends ProcessTrackDef {
  badge: string
  name: string
  scope: string
  summary: string
  steps: ProcessStep[]
}

// Lightest engagement first, matching the services timeline.
export const PROCESS_TRACK_DEFS: readonly ProcessTrackDef[] = [
  { id: 'fast', tone: 'signal' },
  { id: 'deep', tone: 'ink' },
] as const
