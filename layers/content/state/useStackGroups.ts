import { STACK_GROUP_IDS, type StackGroup } from '#layers/content/domain/stack'

export function useStackGroups() {
  const { t } = useI18n()
  const i18nList = useI18nList()

  return computed<StackGroup[]>(() =>
    STACK_GROUP_IDS.map((id) => ({
      id,
      name: t(`home.stack.groups.${id}.name`),
      benefit: t(`home.stack.groups.${id}.benefit`),
      tags: i18nList(`home.stack.groups.${id}.tags`),
    })),
  )
}
