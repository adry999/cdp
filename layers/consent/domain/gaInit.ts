import { consentSignals } from '#layers/consent/domain/consentSignals'

export type GtagCall = readonly [string, ...unknown[]]

// 'consent','default' must be pushed before 'js'/'config' so GA never runs with implicit
// consent between script load and the first 'consent','update' call.
export function buildGaInitSequence(
  gaId: string,
  analyticsGranted: boolean,
  marketingGranted: boolean,
  now: Date,
): GtagCall[] {
  return [
    ['consent', 'default', consentSignals(analyticsGranted, marketingGranted)],
    ['js', now],
    ['config', gaId],
  ]
}
