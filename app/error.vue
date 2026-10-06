<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error?.status === 404)
const title = computed(() => (isNotFound.value ? t('error.notFoundTitle') : t('error.genericTitle')))
const body = computed(() => (isNotFound.value ? t('error.notFoundBody') : t('error.genericBody')))

// app.vue, which sets <html lang> through useLocaleHead, does not render on the error page.
useHead({ htmlAttrs: { lang: () => localeProperties.value.language } })
useSeoMeta({
  title: () => title.value.replace(/\.$/, ''),
})

function goHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <NuxtLayout name="default">
    <SiteSection :number="String(error?.status ?? 500)" :label="t('error.sectionLabel')" padding="2xl" :top-border="false">
      <h1
        class="m-0 max-w-[20ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[1.04] tracking-[-0.025em] text-pretty"
      >
        {{ title }}
      </h1>
      <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-lead text-muted">
        {{ body }}
      </p>
      <AppButton variant="signal" class="mt-8" @click="goHome">
        {{ t('error.backHome') }}
      </AppButton>
    </SiteSection>
  </NuxtLayout>
</template>
