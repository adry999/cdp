<script setup lang="ts">
import { useNewLeadsCount } from '#layers/leads/admin'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { count: newLeadsCount } = useNewLeadsCount()

const navItems = [
  { label: 'Proiecte', to: '/admin/projects' },
  { label: 'Noutăți', to: '/admin/news' },
  { label: 'Hero', to: '/admin/hero' },
  { label: 'Solicitări', to: '/admin/leads' },
] as const

function isActive(to: string) {
  return route.path.startsWith(to)
}

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <aside class="sticky top-0 flex h-screen w-60 flex-none flex-col border-r border-hairline bg-paper">
    <div class="flex h-16 items-center border-b border-hairline px-5">
      <NuxtLink to="/" aria-label="CODEPEDIA" class="flex items-center">
        <img src="/brand/codepedia-mark.svg" alt="" width="32" height="20" class="block h-5 w-auto dark:hidden" >
        <img src="/brand/codepedia-mark-inverse.svg" alt="" width="32" height="20" class="hidden h-5 w-auto dark:block" >
      </NuxtLink>
    </div>
    <nav class="flex flex-col py-3">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="border-l-2 px-5 py-2.5 eyebrow no-underline hover:no-underline"
        :class="
          isActive(item.to)
            ? 'border-signal text-ink'
            : 'border-transparent text-muted hover:text-ink'
        "
      >
        {{ item.label }}
        <span v-if="item.to === '/admin/leads' && newLeadsCount" class="ml-2 text-signal-text">{{ newLeadsCount }}</span>
      </NuxtLink>
    </nav>
    <div class="mt-auto border-t border-hairline px-5 py-4">
      <p class="m-0 truncate eyebrow text-muted" :title="user?.email">{{ user?.email }}</p>
      <div class="mt-3 flex items-center justify-between">
        <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-muted hover:text-signal-text" @click="logout">
          Ieși
        </button>
        <CoreThemeToggle class="-mr-1.5" />
      </div>
    </div>
  </aside>
</template>
