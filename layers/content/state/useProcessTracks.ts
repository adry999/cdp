import { PROCESS_TRACK_DEFS, type ProcessStep, type ProcessTrack } from '#layers/content/domain/process'

/** Shape of one `home.process.tracks.<id>.steps[]` entry before resolution. */
interface RawProcessStep {
  title: string
  body: string
}

// Joins process.ts's track order with `home.process.tracks.<id>` i18n copy into the
// ProcessTrack view-models HomeProcess.vue renders.
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
