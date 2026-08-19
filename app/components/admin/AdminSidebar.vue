<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: 'Proiecte', to: '/admin/projects' },
  { label: 'Servicii', to: '/admin/services' },
  { label: 'Întrebări', to: '/admin/faqs' },
  { label: 'Solicitări', to: '/admin/leads' },
  { label: 'Setări', to: '/admin/settings' },
] as const

function isActive(to: string) {
  return route.path.startsWith(to)
}
</script>

<template>
  <aside class="flex w-60 flex-none flex-col border-r border-hairline bg-paper">
    <div class="flex h-16 items-center border-b border-hairline px-5">
      <NuxtLink to="/" aria-label="Codepedia" class="flex items-center">
        <img src="/brand/codepedia-mark.svg" alt="" width="32" height="20" class="block h-5 w-auto" />
      </NuxtLink>
    </div>
    <nav class="flex flex-col py-3">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="border-l-2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] no-underline hover:no-underline"
        :class="
          isActive(item.to)
            ? 'border-signal text-ink'
            : 'border-transparent text-muted hover:text-ink'
        "
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>
