<script setup lang="ts">
import type { PostBlock } from '#layers/blog'

defineProps<{ blocks: PostBlock[]; postSlug: string; service: string }>()
const { t } = useI18n()
const track = useTrackEvent()

function marker(ordered: boolean, index: number): string {
  return ordered ? String(index + 1).padStart(2, '0') : '—'
}
</script>

<template>
  <div class="max-w-[70ch] leading-[1.7]">
    <template v-for="(block, i) in blocks" :key="i">
      <div
        v-if="block.type === 'callout'"
        class="mb-8 rounded border border-ink bg-hatch p-[clamp(18px,2.2vw,24px)] text-[17px] leading-[1.6] [&_code]:bg-hairline"
      >
        <BlogInline :nodes="block.children" />
      </div>

      <h2
        v-else-if="block.type === 'h2'"
        :id="block.id"
        class="mb-4 mt-12 scroll-mt-24 text-[clamp(22px,2.4vw,28px)] font-semibold leading-[1.2] tracking-[-0.02em] text-pretty"
      >
        {{ block.text }}
      </h2>

      <h3
        v-else-if="block.type === 'h3'"
        class="mb-2 mt-8 text-[19px] font-semibold leading-[1.3] tracking-[-0.01em]"
      >
        {{ block.text }}
      </h3>

      <p v-else-if="block.type === 'p'" class="m-0 mb-5 text-pretty"><BlogInline :nodes="block.children" /></p>

      <component
        :is="block.ordered ? 'ol' : 'ul'"
        v-else-if="block.type === 'list'"
        class="m-0 mb-6 flex list-none flex-col border-t border-hairline p-0"
      >
        <li v-for="(item, k) in block.items" :key="k" class="flex gap-3.5 border-b border-hairline py-3">
          <span aria-hidden="true" class="flex-[0_0_24px] font-mono text-xs leading-[1.9] text-signal-text">{{
            marker(block.ordered, k)
          }}</span>
          <span class="min-w-0 flex-1 text-pretty"><BlogInline :nodes="item" /></span>
        </li>
      </component>

      <div
        v-else-if="block.type === 'table'"
        tabindex="0"
        class="mb-7 overflow-x-auto rounded border border-hairline"
      >
        <table class="w-full border-collapse text-[15px] leading-[1.45] [&_code]:bg-transparent [&_code]:p-0">
          <thead>
            <tr>
              <th
                v-for="(cell, k) in block.head"
                :key="k"
                scope="col"
                class="whitespace-nowrap border-b border-hairline bg-hatch px-3.5 py-2.5 text-left eyebrow-sm font-normal text-muted"
              >
                <BlogInline :nodes="cell" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in block.rows" :key="r">
              <td v-for="(cell, k) in row" :key="k" class="min-w-[120px] border-b border-hairline px-3.5 py-2.5 align-top">
                <BlogInline :nodes="cell" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="block.type === 'faq'" class="mb-8 border-t border-ink">
        <details v-for="item in block.items" :key="item.question" class="border-b border-hairline">
          <summary
            class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[18px] font-medium tracking-[-0.01em] [&::-webkit-details-marker]:hidden"
          >
            {{ item.question }}
            <span aria-hidden="true" class="flex-none font-mono text-base text-signal-text">+</span>
          </summary>
          <p v-for="(paragraph, k) in item.answer" :key="k" class="m-0 mb-[18px] text-ink/80 text-pretty">
            <BlogInline :nodes="paragraph" />
          </p>
        </details>
      </div>

      <div
        v-else-if="block.type === 'cta'"
        class="mt-12 flex flex-col gap-5 rounded bg-ink p-[clamp(24px,3vw,36px)] text-paper"
      >
        <span class="eyebrow-sm text-signal">{{ t('blog.next') }}</span>
        <p class="m-0 text-[clamp(19px,2vw,23px)] leading-[1.35] tracking-[-0.01em] text-pretty">{{ block.text }}</p>
        <NuxtLink
          :to="block.href"
          class="flex min-h-11 items-center self-start rounded bg-signal px-5 eyebrow text-ink no-underline hover:bg-paper hover:text-ink hover:no-underline"
          @click="track('blog_cta_click', { post_slug: postSlug, service })"
        >
          {{ block.label }} →
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
