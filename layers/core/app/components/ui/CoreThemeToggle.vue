<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'icon' | 'row' }>(), { variant: 'icon' })

const { t } = useI18n()
const { theme, toggleTheme } = useTheme()

// What the button will do, so the label names the target theme. Until this component has
// hydrated it assumes light, like the server render, so attributes never mismatch.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const label = computed(() => (mounted.value && theme.value === 'dark' ? t('theme.light') : t('theme.dark')))
</script>

<template>
  <button
    type="button"
    class="flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-ink hover:text-signal-text"
    :class="variant === 'icon' ? 'h-9 w-9 rounded' : 'min-h-11 justify-start gap-3 py-3 text-left'"
    :aria-label="label"
    :title="variant === 'icon' ? label : undefined"
    @click="toggleTheme"
  >
    <!-- Both icons are always in the markup; CSS shows the one for the current data-theme, so SSR and client agree. -->
    <svg
      class="h-[18px] w-[18px] flex-none dark:hidden"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
    <svg
      class="hidden h-[18px] w-[18px] flex-none dark:block"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <template v-if="variant === 'row'">
      <span class="dark:hidden" aria-hidden="true">{{ t('theme.dark') }}</span>
      <span class="hidden dark:inline" aria-hidden="true">{{ t('theme.light') }}</span>
    </template>
  </button>
</template>
