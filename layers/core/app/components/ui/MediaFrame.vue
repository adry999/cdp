<script setup lang="ts">
type Ratio = '16/9' | '16/10' | '4/3'

const props = withDefaults(
  defineProps<{
    ratio?: Ratio
    src?: string
    alt?: string
    label?: string
    /** @nuxt/image syntax: every entry needs a screen key (xs:100vw lg:380px), or the image renders blank. */
    sizes?: string
    priority?: boolean
    zoomable?: boolean
  }>(),
  { ratio: '16/10', src: undefined, alt: '', label: undefined, sizes: 'xs:100vw md:100vw lg:100vw', priority: false, zoomable: false },
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

const dialog = ref<HTMLDialogElement | null>(null)

function openZoom() {
  if (props.zoomable && props.src) {
    dialog.value?.showModal()
  }
}

function closeZoom() {
  dialog.value?.close()
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
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    :preload="priority ? { fetchPriority: 'high' } : undefined"
    :class="[aspectClass, 'block w-full rounded border border-hairline object-cover', zoomable ? 'cursor-zoom-in' : '']"
    @click="openZoom"
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

  <dialog
    v-if="zoomable && src"
    ref="dialog"
    class="backdrop:bg-[#020420]/80 backdrop:backdrop-blur-sm m-auto max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-0 rounded overflow-hidden shadow-2xl focus:outline-none"
    @click.self="closeZoom"
  >
    <NuxtImg
      :src="src"
      :alt="alt"
      class="block w-full h-full max-w-[95vw] max-h-[95vh] object-contain cursor-zoom-out"
      @click="closeZoom"
    />
  </dialog>
</template>
