<script setup lang="ts">
const props = defineProps<{
  shots: { path: string; alt: string }[]
  /** Index of the shown screenshot; null while closed. */
  index: number | null
}>()
const emit = defineEmits<{ close: []; change: [index: number] }>()
const { t } = useI18n()

const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

const isOpen = computed(() => props.index !== null && props.shots.length > 0)
const current = computed(() => (props.index === null ? undefined : props.shots[props.index]))

function step(delta: number) {
  if (props.index === null) return
  const total = props.shots.length
  emit('change', (props.index + delta + total) % total)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  } else if (event.key === 'Tab' && dialog.value) {
    // Keep focus inside the dialog.
    const focusable = Array.from(dialog.value.querySelectorAll<HTMLElement>('button'))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    const active = document.activeElement
    if (event.shiftKey && (active === first || !dialog.value.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !dialog.value.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }
}

let trigger: HTMLElement | null = null
let previousOverflow = ''
let listening = false

function attach() {
  if (listening) return
  listening = true
  trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKeydown)
  nextTick(() => closeButton.value?.focus())
}

function detach() {
  if (!listening) return
  listening = false
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = previousOverflow
  trigger?.focus()
  trigger = null
}

watch(isOpen, (open) => (open ? attach() : detach()), { flush: 'post' })
onBeforeUnmount(detach)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && current"
      ref="dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="t('caseStudy.lightbox.label')"
      class="fixed inset-0 z-[100] flex flex-col gap-4 bg-ink/95 p-[clamp(12px,3vw,32px)]"
      @click.self="emit('close')"
    >
      <div class="flex items-center justify-between text-paper eyebrow" @click.self="emit('close')">
        <span aria-live="polite">{{ t('caseStudy.lightbox.counter', { current: (index ?? 0) + 1, total: shots.length }) }}</span>
        <button
          ref="closeButton"
          type="button"
          :aria-label="t('caseStudy.lightbox.close')"
          class="min-h-11 min-w-11 cursor-pointer rounded border border-paper/30 bg-transparent px-3 eyebrow text-paper hover:border-paper"
          @click="emit('close')"
        >
          {{ t('caseStudy.lightbox.closeButton') }}
        </button>
      </div>
      <div class="flex min-h-0 flex-1 items-center justify-center gap-3" @click.self="emit('close')">
        <button
          type="button"
          :aria-label="t('caseStudy.lightbox.prev')"
          class="h-12 w-12 flex-none cursor-pointer rounded border border-paper/30 bg-transparent text-lg text-paper hover:border-paper"
          @click="step(-1)"
        >
          ←
        </button>
        <div class="flex h-full min-w-0 flex-1 items-center justify-center" @click.self="emit('close')">
          <NuxtImg
            :key="current.path"
            :src="current.path"
            :alt="current.alt"
            :width="1600"
            :height="900"
            sizes="xs:100vw md:100vw lg:100vw"
            class="block h-auto max-h-full w-auto max-w-full rounded border border-hairline-ink object-contain"
          />
        </div>
        <button
          type="button"
          :aria-label="t('caseStudy.lightbox.next')"
          class="h-12 w-12 flex-none cursor-pointer rounded border border-paper/30 bg-transparent text-lg text-paper hover:border-paper"
          @click="step(1)"
        >
          →
        </button>
      </div>
    </div>
  </Teleport>
</template>
