<script setup lang="ts">
const PADDING_CLASSES = {
  xs: 'py-[clamp(36px,5vw,64px)]',
  sm: 'py-[clamp(40px,5vw,72px)]',
  md: 'py-[clamp(40px,6vw,88px)]',
  default: 'py-[clamp(48px,6vw,96px)]',
  lg: 'py-[clamp(48px,7vw,104px)]',
  xl: 'py-[clamp(56px,7vw,112px)]',
  '2xl': 'py-[clamp(64px,10vw,140px)]',
  hero: 'pt-[clamp(48px,8vw,120px)] pb-[clamp(40px,5vw,72px)]',
  heroCompact: 'pt-[clamp(36px,5.5vw,84px)] pb-[clamp(24px,3.2vw,44px)]',
} as const

type Padding = keyof typeof PADDING_CLASSES

const props = withDefaults(
  defineProps<{
    number?: string
    label?: string
    sectionId?: string
    inverted?: boolean
    padding?: Padding
    topBorder?: boolean
  }>(),
  { number: undefined, label: undefined, sectionId: undefined, inverted: false, padding: 'default', topBorder: true },
)

const showTopBorder = computed(() => props.topBorder && !props.inverted)
</script>

<template>
  <section
    :id="sectionId"
    class="relative overflow-hidden scroll-mt-16"
    :class="[
      inverted ? 'bg-ink text-paper' : undefined,
      showTopBorder ? 'border-t border-hairline' : undefined,
    ]"
  >
    <slot name="background" />
    <div
      class="container-site relative z-10 flex flex-wrap gap-[clamp(24px,4vw,48px)]"
      :class="PADDING_CLASSES[padding]"
    >
      <div class="flex-[0_0_160px]">
        <slot name="label">
          <SectionLabel v-if="label" :number="number" :label="label" :inverted="inverted" />
        </slot>
      </div>
      <div class="min-w-0 flex-[1_1_560px]">
        <slot />
      </div>
    </div>
  </section>
</template>
