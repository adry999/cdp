<script setup lang="ts">
// The confirmation that replaces the contact form after a successful send, in every placement
// (dialog, home, /contact): check mark, the sentence, the three next steps. The default slot holds
// actions; only the dialog fills it (its Close button).
const { t } = useI18n()
const i18nList = useI18nList()
const steps = computed(() => i18nList('contactPage.steps'))

const sentence = useTemplateRef<HTMLElement>('sentence')

// The confirmation takes focus so a screen reader announces it.
onMounted(() => nextTick(() => sentence.value?.focus()))
</script>

<template>
  <div role="status" class="flex flex-col gap-5 border-t border-hairline pt-6">
    <div class="flex items-center gap-3">
      <span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal text-lg text-ink">✓</span>
      <p ref="sentence" class="m-0 text-lg font-semibold outline-none" tabindex="-1">{{ t('home.contact.form.success') }}</p>
    </div>
    <ol class="m-0 flex list-none flex-col border-b border-hairline p-0">
      <li v-for="(step, index) in steps" :key="step" class="flex gap-4 border-t border-hairline py-3 text-[15px]">
        <span class="font-mono text-xs text-signal-text">{{ String(index + 1).padStart(2, '0') }}</span>
        {{ step }}
      </li>
    </ol>
    <slot />
  </div>
</template>
