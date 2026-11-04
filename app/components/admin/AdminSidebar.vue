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

// Below the nav breakpoint the menu folds under a button; a new page closes it.
const menuOpen = ref(false)
watch(
  () => route.path,
  () => {
    menuOpen.value = false
  },
)

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <aside
    class="flex flex-none flex-col border-b border-hairline bg-paper nav:sticky nav:top-0 nav:h-screen nav:w-60 nav:border-r nav:border-b-0"
  >
    <div class="flex h-16 flex-none items-center justify-between border-b border-hairline px-5">
      <NuxtLink to="/" aria-label="CODEPEDIA" class="flex items-center">
        <img src="/brand/codepedia-mark.svg" alt="" width="32" height="20" class="block h-5 w-auto dark:hidden" >
        <img src="/brand/codepedia-mark-inverse.svg" alt="" width="32" height="20" class="hidden h-5 w-auto dark:block" >
      </NuxtLink>
      <button
        type="button"
        class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-muted hover:text-ink nav:hidden"
        aria-controls="admin-menu"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? 'Închide' : 'Meniu' }}
      </button>
    </div>
    <div id="admin-menu" class="flex-1 flex-col nav:flex" :class="menuOpen ? 'flex' : 'hidden'">
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
        <NuxtLink
          to="/admin/account"
          class="block truncate eyebrow no-underline hover:text-ink hover:no-underline"
          :class="isActive('/admin/account') ? 'text-ink' : 'text-muted'"
          :title="user?.email"
        >
          {{ user?.email }}
        </NuxtLink>
        <div class="mt-3 flex items-center justify-between">
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-muted hover:text-signal-text" @click="logout">
            Ieși
          </button>
          <CoreThemeToggle class="-mr-1.5" />
        </div>
      </div>
    </div>
  </aside>
</template>
