<script setup lang="ts">
import type { InlineNode } from '#layers/blog'

defineProps<{ nodes: InlineNode[] }>()

// Internal links stay client-side NuxtLinks; anything else is a normal anchor.
function isInternal(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

const linkClass = 'underline decoration-signal underline-offset-[3px] hover:text-signal-text'
</script>

<template>
  <template v-for="(node, i) in nodes" :key="i">
    <template v-if="node.type === 'text'">{{ node.text }}</template>
    <br v-else-if="node.type === 'break'">
    <code v-else-if="node.type === 'code'" class="rounded-[3px] bg-hatch px-[0.35em] py-[0.1em] font-mono text-[0.88em]">{{ node.text }}</code>
    <strong v-else-if="node.type === 'strong'" class="font-semibold"><BlogInline :nodes="node.children" /></strong>
    <em v-else-if="node.type === 'em'"><BlogInline :nodes="node.children" /></em>
    <NuxtLink v-else-if="isInternal(node.href)" :to="node.href" :class="linkClass"><BlogInline :nodes="node.children" /></NuxtLink>
    <a v-else :href="node.href" rel="noopener" :class="linkClass"><BlogInline :nodes="node.children" /></a>
  </template>
</template>
