import type { Ref } from 'vue'
import { readingProgress } from '#layers/core/shared/utils/readingProgress'

/** Scroll progress (`0`–`1`) of the page while `enabled`; updates once per frame. */
export function useReadingProgress(enabled: Readonly<Ref<boolean>>): Readonly<Ref<number>> {
  const route = useRoute()
  const progress = ref(0)
  let frame = 0

  function measure() {
    frame = 0
    const root = document.documentElement
    progress.value = readingProgress(window.scrollY, root.scrollHeight, window.innerHeight)
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(measure)
  }

  function stop() {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  onMounted(() => {
    watch(
      enabled,
      (on) => {
        stop()
        if (!on) {
          progress.value = 0
          return
        }
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule)
        measure()
      },
      { immediate: true, flush: 'post' },
    )
    // A new article changes the page height after the route settles.
    watch(() => route.fullPath, () => enabled.value && schedule(), { flush: 'post' })
  })
  onBeforeUnmount(stop)

  return progress
}
