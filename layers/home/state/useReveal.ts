import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useReveal({ threshold = 0.1, once = true }: { threshold?: number; once?: boolean } = {}) {
  const el = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  const hasMounted = ref(false)
  let io: IntersectionObserver | undefined

  onMounted(() => {
    hasMounted.value = true
    // No scroll-triggered motion for visitors who asked for less of it, or where observing is impossible.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !el.value || typeof IntersectionObserver === 'undefined') {
      isVisible.value = true
      return
    }

    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible.value = entry.isIntersecting

          if (entry.isIntersecting && once) {
            io?.disconnect()
            break
          }
        }
      },
      { threshold },
    )
    io.observe(el.value)
  })

  onBeforeUnmount(() => io?.disconnect())

  return { el, isVisible, hasMounted }
}
