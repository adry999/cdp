<script setup lang="ts">
withDefaults(
  defineProps<{
    figures: { v: string; k: string }[]
    /** `strip` sits on the black outcome bar of the incident card. */
    variant?: 'rule' | 'strip'
  }>(),
  { variant: 'rule' },
)
</script>

<template>
  <div class="grid grid-fit-safe-180 gap-4">
    <div v-for="(figure, i) in figures" :key="`${i}-${figure.k}`" :class="variant === 'rule' ? 'border-t border-ink pt-4' : undefined">
      <div
        class="font-semibold leading-none tracking-[-0.03em]"
        :class="variant === 'rule' ? 'text-[clamp(34px,4.4vw,56px)]' : 'text-[clamp(30px,3.6vw,44px)]'"
      >
        {{ figure.v }}
      </div>
      <div class="eyebrow" :class="variant === 'rule' ? 'mt-[10px] text-muted' : 'mt-2 text-muted-ink'">
        {{ figure.k }}
      </div>
    </div>
  </div>
</template>
