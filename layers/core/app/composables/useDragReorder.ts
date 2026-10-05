// One instance per reorderable list: a drop only counts when it follows a drag started in the
// same list, and dropping an item on itself is ignored.
export function useDragReorder(onMove: (from: number, to: number) => void) {
  const draggingIndex = ref<number | null>(null)

  function start(index: number) {
    draggingIndex.value = index
  }

  function drop(index: number) {
    const from = draggingIndex.value
    if (from === null || from === index) return
    draggingIndex.value = null
    onMove(from, index)
  }

  function isDragging(index: number) {
    return draggingIndex.value === index
  }

  return { start, drop, isDragging }
}
