<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { t } = useI18n()
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
        />
        {{ t('footer.legal') }}
      </span>
      <span v-if="!compact">{{ t('footer.tagline') }}</span>
      <span>{{ t('footer.copyright') }}</span>
    </div>
  </footer>
</template>
