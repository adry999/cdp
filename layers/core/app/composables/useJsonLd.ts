import type { MaybeRefOrGetter } from 'vue'

export function useJsonLd(...items: MaybeRefOrGetter<object | null>[]) {
  useHead(() => ({
    script: items.flatMap((item) => {
      const value = toValue(item)
      return value ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(value) }] : []
    }),
  }))
}
