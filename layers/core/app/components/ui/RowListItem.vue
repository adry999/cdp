<script setup lang="ts">
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    title: string
    index?: string
    tag?: 'h2' | 'h3'
    size?: Size
  }>(),
  { index: undefined, tag: 'h3', size: 'md' },
)

const SIZES: Record<
  Size,
  { row: string; index: string; group: boolean; groupGap: string; title: string; body: string }
> = {
  sm: {
    row: 'gap-[clamp(16px,3vw,40px)] py-5',
    index: 'flex-[0_0_80px] tracking-[0.08em]',
    group: true,
    groupGap: 'gap-[clamp(16px,3vw,40px)]',
    title: 'flex-[0_0_200px] text-[19px]',
    body: 'max-w-[58ch] flex-[1_1_280px]',
  },
  md: {
    row: 'gap-[clamp(16px,3vw,40px)] py-[clamp(20px,2.5vw,28px)]',
    index: '',
    group: false,
    groupGap: '',
    title: 'flex-[0_0_240px] text-[19px]',
    body: 'max-w-[60ch] flex-[1_1_320px]',
  },
  lg: {
    row: 'gap-x-[clamp(16px,3vw,40px)] gap-y-3 py-[clamp(22px,3vw,32px)]',
    index: 'flex-[0_0_48px] tracking-[0.14em]',
    group: false,
    groupGap: '',
    title: 'flex-[0_0_260px] text-xl',
    body: 'flex-[1_1_300px]',
  },
}

const cfg = computed(() => SIZES[props.size])
</script>

<template>
  <div class="flex flex-wrap border-t border-hairline" :class="cfg.row">
    <div v-if="index" class="font-mono text-xs text-signal" :class="cfg.index">{{ index }}</div>
    <div v-if="cfg.group" class="flex min-w-0 flex-[1_1_340px] flex-wrap" :class="cfg.groupGap">
      <component :is="tag" class="m-0 font-medium tracking-[-0.02em]" :class="cfg.title">{{ title }}</component>
      <p class="m-0 text-base text-muted" :class="cfg.body"><slot /></p>
    </div>
    <template v-else>
      <component :is="tag" class="m-0 font-medium tracking-[-0.02em]" :class="cfg.title">{{ title }}</component>
      <p class="m-0 text-base text-muted" :class="cfg.body"><slot /></p>
    </template>
  </div>
</template>
