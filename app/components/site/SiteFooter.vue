<script setup lang="ts">
import { useCookieConsent } from '#layers/consent'
import { useSiteSettings } from '#layers/content'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { t } = useI18n()
const { openSettings } = useCookieConsent()
const settings = useSiteSettings()

const legalLine = computed(() => settings.value.footerLine)
const copyrightLine = computed(() => `© ${settings.value.copyrightYear}`)
</script>

<template>
  <footer class="border-t border-hairline">
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap items-baseline justify-between gap-4 px-gutter py-6 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
    >
      <span class="flex items-center gap-2">
        <img
          src="/brand/codepedia-mark.svg"
          alt=""
          width="19"
          height="12"
          class="block h-3 w-auto opacity-50"
        >
        {{ legalLine }}
      </span>
      <span v-if="!compact">{{ t('footer.tagline') }}</span>
      <button type="button" class="cursor-pointer bg-transparent text-muted hover:text-ink" @click="openSettings">
        {{ t('footer.cookieSettings') }}
      </button>
      <span>{{ copyrightLine }}</span>
    </div>
  </footer>
</template>
