import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useReveal({ threshold = 0.1, once = false }: { threshold?: number; once?: boolean } = {}) {
  const options = { threshold, once }
  const el = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  const hasMounted = ref(false)

  onMounted(() => {
    hasMounted.value = true
    if (!el.value || typeof IntersectionObserver === 'undefined') {
      isVisible.value = true
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible.value = entry.isIntersecting
          
          if (entry.isIntersecting && options.once) {
            io.disconnect()
            break
          }
        }
      },
      { threshold: options.threshold }
    )
    
    io.observe(el.value)
    
    onBeforeUnmount(() => {
      io.disconnect()
    })
  })
  
  return { el, isVisible, hasMounted }
}

