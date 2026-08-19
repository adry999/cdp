<script setup lang="ts">
type Padding = 'hero' | 'default' | 'ink'

const props = withDefaults(
  defineProps<{
    number: string
    label: string
    sectionId?: string
    inverted?: boolean
    padding?: Padding
    /** Raw clamp() value, overrides `padding` when set (for one-off section paddings). */
    paddingY?: string
    topBorder?: boolean
  }>(),
  { inverted: false, padding: 'default', topBorder: true },
)

const paddingClass = computed(() => {
  if (props.paddingY) return undefined
  if (props.padding === 'hero') return 'pt-[clamp(48px,8vw,120px)] pb-[clamp(40px,5vw,72px)]'
  if (props.padding === 'ink') return 'py-[clamp(56px,7vw,112px)]'
  return 'py-[clamp(48px,6vw,96px)]'
})

const paddingStyle = computed(() =>
  props.paddingY ? { paddingTop: props.paddingY, paddingBottom: props.paddingY } : undefined,
)

const showTopBorder = computed(() => props.topBorder && !props.inverted)
</script>

<template>
  <section
    :id="sectionId"
    class="scroll-mt-16"
    :class="[
      inverted ? 'bg-ink text-paper' : undefined,
      showTopBorder ? 'border-t border-hairline' : undefined,
    ]"
  >
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap gap-[clamp(24px,4vw,48px)] px-gutter"
      :class="paddingClass"
      :style="paddingStyle"
    >
      <div class="flex-[0_0_160px]">
        <slot name="label">
          <SectionLabel :number="number" :label="label" :inverted="inverted" />
        </slot>
      </div>
      <div class="min-w-0 flex-[1_1_560px]">
        <slot />
      </div>
    </div>
  </section>
</template>
