<script setup lang="ts">
type Ratio = '16/9' | '16/10' | '4/3'

const props = withDefaults(
  defineProps<{
    ratio?: Ratio
    src?: string
    alt?: string
    label?: string
  }>(),
  { ratio: '16/10', alt: '' },
)

const aspectClass = computed(() => {
  if (props.ratio === '16/9') return 'aspect-[16/9]'
  if (props.ratio === '4/3') return 'aspect-[4/3]'
  return 'aspect-[16/10]'
})

const placeholderStyle = {
  backgroundImage:
    'url(/brand/codepedia-mark-watermark.svg), repeating-linear-gradient(45deg, var(--color-hatch) 0 1px, transparent 1px 7px)',
  backgroundRepeat: 'no-repeat, repeat',
  backgroundPosition: 'center 44%, 0 0',
  backgroundSize: '56px auto, auto',
}
</script>

<template>
  <NuxtImg
    v-if="src"
    :src="src"
    :alt="alt"
    :class="[aspectClass, 'block w-full rounded border border-hairline object-cover']"
  />
  <div
    v-else
    class="flex items-end justify-center rounded border border-hairline pb-[14px]"
    :class="aspectClass"
    :style="placeholderStyle"
  >
    <span v-if="label" class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
      {{ label }}
    </span>
  </div>
</template>
