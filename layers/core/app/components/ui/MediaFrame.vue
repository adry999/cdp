<script setup lang="ts">
type Ratio = '16/9' | '16/10' | '4/3'

const props = withDefaults(
  defineProps<{
    ratio?: Ratio
    src?: string
    alt?: string
    label?: string
    /** @nuxt/image syntax: every entry needs a screen key, a name from image.screens or a viewport width (320:400px 1024:380px), or it is ignored. */
    sizes?: string
    priority?: boolean
  }>(),
  { ratio: '16/10', src: undefined, alt: '', label: undefined, sizes: '320:400px 480:640px 640:800px 768:960px 1024:1280px', priority: false },
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
</script>

<template>
  <NuxtImg
    v-if="src"
    :src="src"
    :alt="alt"
    :width="intrinsicSize.width"
    :height="intrinsicSize.height"
    :sizes="sizes"
    format="webp"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    :preload="priority ? { fetchPriority: 'high' } : undefined"
    :class="[aspectClass, 'block w-full rounded border border-hairline object-cover object-top']"
  />
  <div
    v-else
    class="flex items-end justify-center rounded border border-hairline pb-[14px] media-placeholder"
    :class="aspectClass"
  >
    <span v-if="label" class="eyebrow-sm text-muted">
      {{ label }}
    </span>
  </div>
</template>
