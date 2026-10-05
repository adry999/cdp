export function useI18nList() {
  const { tm, rt } = useI18n()
  return (key: string): string[] => (tm(key) as unknown[]).map((entry) => rt(entry as string))
}
