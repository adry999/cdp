import { PROCESS_TRACK_DEFS, type ProcessStep, type ProcessTrack } from '~/types/process'

/** Shape of one `home.process.tracks.<id>.steps[]` entry before resolution. */
interface RawProcessStep {
  title: string
  body: string
}

/**
 * Joins the structural track defs (app/types/process.ts — order + badge tone)
 * with their localised copy from the `home.process.tracks.<id>` i18n block,
 * producing the `ProcessTrack` view-models HomeProcess.vue renders. All editable
 * text lives in i18n/locales/{ro,en}.json under `home.process`; nothing here.
 */
export function useProcessTracks() {
  const { t, tm, rt } = useI18n()

  return computed<ProcessTrack[]>(() =>
    PROCESS_TRACK_DEFS.map((def) => {
      const rawSteps = tm(`home.process.tracks.${def.id}.steps`) as unknown as RawProcessStep[]
      const steps: ProcessStep[] = rawSteps.map((entry, i) => ({
        index: String(i + 1).padStart(2, '0'),
        title: rt(entry.title),
        body: rt(entry.body),
      }))

      return {
        ...def,
        badge: t(`home.process.tracks.${def.id}.badge`),
        name: t(`home.process.tracks.${def.id}.name`),
        scope: t(`home.process.tracks.${def.id}.scope`),
        summary: t(`home.process.tracks.${def.id}.summary`),
        steps,
      }
    }),
  )
}
