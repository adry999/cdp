<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error?.status === 404)
const title = computed(() => (isNotFound.value ? t('error.notFoundTitle') : t('error.genericTitle')))
const body = computed(() => (isNotFound.value ? t('error.notFoundBody') : t('error.genericBody')))

function goHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <NuxtLayout name="default">
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap gap-[clamp(24px,4vw,48px)] px-gutter py-[clamp(64px,10vw,140px)]"
    >
      <div class="flex-[0_0_160px]">
        <SectionLabel :number="String(error?.status ?? 500)" :label="t('error.sectionLabel')" />
      </div>
      <div class="min-w-0 flex-[1_1_560px]">
        <h1
          class="m-0 max-w-[20ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[1.04] tracking-[-0.025em]"
          style="text-wrap: pretty"
        >
          {{ title }}
        </h1>
        <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] text-muted">
          {{ body }}
        </p>
        <AppButton variant="signal" class="mt-8" @click="goHome">
          {{ t('error.backHome') }}
        </AppButton>
      </div>
    </div>
  </NuxtLayout>
</template>
