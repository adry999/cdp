export function useQualifierAvailability() {
  const config = useRuntimeConfig()
  const isQualifierEnabled = computed(() => config.public.qualifierEnabled === true)
  return { isQualifierEnabled }
}
