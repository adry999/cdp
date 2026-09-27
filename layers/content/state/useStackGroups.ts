import { STACK_GROUP_IDS, type StackGroup } from '#layers/content/domain/stack'

export function useStackGroups() {
  const { t, tm, rt } = useI18n()

  return computed<StackGroup[]>(() =>
    STACK_GROUP_IDS.map((id) => ({
      id,
      name: t(`home.stack.groups.${id}.name`),
      benefit: t(`home.stack.groups.${id}.benefit`),
      tags: (tm(`home.stack.groups.${id}.tags`) as unknown[]).map((entry) => rt(entry as string)),
    })),
  )
}
