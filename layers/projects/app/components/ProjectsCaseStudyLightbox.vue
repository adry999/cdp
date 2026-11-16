<script setup lang="ts">
import { shotCaptions } from '#layers/projects/domain/caseStudySections'

const props = defineProps<{
  shots: { path: string; alt: string }[]
  /** Index of the shown screenshot; null while closed. */
  index: number | null
}>()
const emit = defineEmits<{ close: []; change: [index: number] }>()
const { t } = useI18n()

const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

const current = computed(() => (props.index === null ? undefined : props.shots[props.index]))
// Open only while the index points at a shot, so a shrinking list cannot leave the page locked.
const isOpen = computed(() => current.value !== undefined)
// The same caption line the gallery shows under each tile, when the shots have their own alt texts.
const captions = computed(() => shotCaptions(props.shots))
const caption = computed(() => (props.index === null ? undefined : captions.value?.[props.index]))

function step(delta: number) {
  if (props.index === null) return
  const total = props.shots.length
  emit('change', (props.index + delta + total) % total)
}

function onArrowKeys(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  }
}

// Scroll lock, Escape, the Tab trap and focus return come from useModalLock; only the arrows are local.
useModalLock(dialog, isOpen, () => emit('close'), { focusInitial: () => closeButton.value?.focus() })

watch(isOpen, (open) => (open ? document.addEventListener('keydown', onArrowKeys) : document.removeEventListener('keydown', onArrowKeys)), {
  flush: 'post',
})
onBeforeUnmount(() => document.removeEventListener('keydown', onArrowKeys))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && current"
      ref="dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="t('caseStudy.lightbox.label')"
      class="fixed inset-0 z-[100] flex flex-col gap-4 bg-scrim/95 p-[clamp(12px,3vw,32px)]"
      @mousedown.self="emit('close')"
    >
      <div class="flex items-center justify-between text-on-inverse eyebrow" @mousedown.self="emit('close')">
        <span aria-live="polite">{{ t('caseStudy.lightbox.counter', { current: (index ?? 0) + 1, total: shots.length }) }}</span>
        <button
          ref="closeButton"
          type="button"
          :aria-label="t('caseStudy.lightbox.close')"
          class="min-h-11 min-w-11 cursor-pointer rounded border border-on-inverse/30 bg-transparent px-3 eyebrow text-on-inverse hover:border-on-inverse"
          @click="emit('close')"
        >
          {{ t('caseStudy.lightbox.closeButton') }}
        </button>
      </div>
      <!-- Below sm the arrows sit in a row under the image, so the image gets the full width.
           DOM order (prev, image, next) stays the same, so Tab still goes Close → prev → next. -->
      <div
        class="flex min-h-0 flex-1 flex-wrap content-center items-center justify-center gap-3 sm:flex-nowrap"
        @mousedown.self="emit('close')"
      >
        <button
          type="button"
          :aria-label="t('caseStudy.lightbox.prev')"
          class="order-2 h-12 w-12 flex-none cursor-pointer rounded border border-on-inverse/30 bg-transparent text-lg text-on-inverse hover:border-on-inverse sm:order-none"
          @click="step(-1)"
        >
          ←
        </button>
        <figure
          class="order-1 m-0 flex min-h-0 min-w-0 basis-full flex-col items-center justify-center gap-3 sm:order-none sm:h-full sm:flex-1 sm:basis-auto"
          @mousedown.self="emit('close')"
        >
          <NuxtImg
            :key="current.path"
            :src="current.path"
            :alt="current.alt"
            :width="1600"
            :height="900"
            sizes="320:400px 480:640px 640:800px 768:960px 1024:1280px 1280:1600px"
            format="webp"
            class="block h-auto min-h-0 max-h-full w-auto max-w-full rounded border border-hairline-ink object-contain"
          />
          <figcaption v-if="caption" class="flex max-w-[64ch] flex-col items-center gap-1 text-center">
            <span v-if="caption.title" class="eyebrow-sm text-on-inverse">{{ caption.title }}</span>
            <span class="text-[15px] leading-[1.5] text-muted-ink">{{ caption.text }}</span>
          </figcaption>
        </figure>
        <button
          type="button"
          :aria-label="t('caseStudy.lightbox.next')"
          class="order-3 h-12 w-12 flex-none cursor-pointer rounded border border-on-inverse/30 bg-transparent text-lg text-on-inverse hover:border-on-inverse sm:order-none"
          @click="step(1)"
        >
          →
        </button>
      </div>
    </div>
  </Teleport>
</template>
