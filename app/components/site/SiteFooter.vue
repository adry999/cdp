<script setup lang="ts">
import { useCookieConsent } from '#layers/consent'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { t, locale } = useI18n()
const { openSettings } = useCookieConsent()

// Shares the 'home' cache key with HomeContact/HomeWork/app.vue/etc., so this
// doesn't add a second round trip on pages that already fetch it.
const { data: home } = await useHomeData()
const settings = computed(() => home.value?.settings)

// The CMS footer line (Setări → Footer) overrides the i18n string once an
// admin fills it in; an empty field keeps the i18n default.
const legalLine = computed(
  () => pick(settings.value?.footer_line_ro ?? '', settings.value?.footer_line_en, locale.value) || t('footer.legal'),
)
const copyrightLine = computed(() =>
  settings.value?.copyright_year ? `© ${settings.value.copyright_year}` : t('footer.copyright'),
)
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
