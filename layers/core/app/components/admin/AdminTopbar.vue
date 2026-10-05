<script setup lang="ts">
defineProps<{ title: string; back?: { to: string; label: string } }>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="flex h-16 flex-none items-center justify-between border-b border-hairline px-6">
    <div class="flex items-center gap-4">
      <NuxtLink
        v-if="back"
        :to="back.to"
        class="eyebrow text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← {{ back.label }}
      </NuxtLink>
      <h1 class="m-0 text-lg font-medium tracking-[-0.02em]">{{ title }}</h1>
    </div>
    <div class="flex items-center gap-4">
      <slot name="actions" />
      <div class="flex items-center gap-3 border-l border-hairline pl-4 eyebrow text-muted">
        <span>{{ user?.email }}</span>
        <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal" @click="logout">
          Ieși
        </button>
      </div>
    </div>
  </div>
</template>
