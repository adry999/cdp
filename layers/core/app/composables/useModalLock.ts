import type { Ref } from 'vue'

interface ModalLockOptions {
  // Where focus returns on close. Omitted: the element focused when the dialog opened.
  returnFocusTo?: Ref<HTMLElement | null>
  // Moves focus into the dialog on open. Omitted: the first focusable control in the panel.
  focusInitial?: () => void
}

// Shared plumbing of a modal dialog: page scroll lock, Escape and the Tab trap, initial focus and
// focus return. The host mounts these dialogs lazily, usually already open, so the lock also starts
// on mount when `isOpen` is true (onMounted waits until the dialog is in the document).
export function useModalLock(
  panel: Readonly<Ref<HTMLElement | null | undefined>>,
  isOpen: Readonly<Ref<boolean>>,
  close: () => void,
  options: ModalLockOptions = {},
) {
  const { focusFirst, bind, unbind } = useDialogKeys(panel, close)
  let previouslyFocused: HTMLElement | null = null
  let restoreOverflow = ''

  function capture() {
    bind()
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    restoreOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    nextTick(options.focusInitial ?? focusFirst)
  }

  function release() {
    unbind()
    document.documentElement.style.overflow = restoreOverflow
    const target = options.returnFocusTo ?? ref(previouslyFocused)
    target.value?.focus()
    if (options.returnFocusTo) options.returnFocusTo.value = null
    previouslyFocused = null
  }

  watch(isOpen, (open) => {
    if (!import.meta.client) return
    if (open) capture()
    else release()
  })

  onMounted(() => {
    if (isOpen.value) capture()
  })

  onBeforeUnmount(() => {
    if (import.meta.client && isOpen.value) document.documentElement.style.overflow = restoreOverflow
  })
}
