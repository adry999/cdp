import { STACK_GROUP_DEFS, type StackGroup } from '~/types/stack'

/**
 * Joins the structural group defs (app/types/stack.ts — order + icon) with their
 * localised copy from the `home.stack.groups.<id>` i18n block, producing the
 * `StackGroup` view-models HomeStack.vue renders. All editable text lives in
 * i18n/locales/{ro,en}.json under `home.stack`; nothing here.
 */
export function useStackGroups() {
  const { t, tm, rt } = useI18n()

  return computed<StackGroup[]>(() =>
    STACK_GROUP_DEFS.map((def) => ({
      ...def,
      name: t(`home.stack.groups.${def.id}.name`),
      benefit: t(`home.stack.groups.${def.id}.benefit`),
      tags: (tm(`home.stack.groups.${def.id}.tags`) as unknown[]).map((entry) => rt(entry as string)),
    })),
  )
}
