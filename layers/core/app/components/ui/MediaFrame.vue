<script setup lang="ts">
type Ratio = '16/9' | '16/10' | '4/3'

const props = withDefaults(
  defineProps<{
    ratio?: Ratio
    src?: string
    alt?: string
    label?: string
    /** Passed straight to NuxtImg so it generates a real srcset — without it
     *  every viewport downloads the same full-size image. Override per call
     *  site when the frame isn't close to full container width. Uses
     *  @nuxt/image syntax with a screen key on every entry
     *  (`xs:100vw sm:45vw lg:380px`), not CSS media queries — a bare value
     *  parses as a 1px screen and the image renders blank. */
    sizes?: string
    /** 'eager' for the above-the-fold hero screenshot (the page's LCP
     *  candidate); everything else should stay lazy. */
    loading?: 'lazy' | 'eager'
  }>(),
  { ratio: '16/10', src: undefined, alt: '', label: undefined, sizes: 'xs:100vw md:100vw lg:100vw', loading: 'lazy' },
)

const aspectClass = computed(() => {
  if (props.ratio === '16/9') return 'aspect-[16/9]'
  if (props.ratio === '4/3') return 'aspect-[4/3]'
  return 'aspect-[16/10]'
})

// aspectClass already reserves layout space, so these aren't preventing CLS — they're the
// intrinsic dimensions NuxtImg needs for its srcset, matching the admin editor's upload labels.
const intrinsicSize = computed(() => {
  if (props.ratio === '16/9') return { width: 1600, height: 900 }
  if (props.ratio === '4/3') return { width: 1200, height: 900 }
  return { width: 1200, height: 750 }
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
    :width="intrinsicSize.width"
    :height="intrinsicSize.height"
    :sizes="sizes"
    :loading="loading"
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
