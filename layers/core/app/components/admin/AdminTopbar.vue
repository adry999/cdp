<script setup lang="ts">
defineProps<{ title: string }>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="flex h-16 flex-none items-center justify-between border-b border-hairline px-6">
    <h1 class="m-0 text-lg font-medium tracking-[-0.02em]">{{ title }}</h1>
    <div class="flex items-center gap-4">
      <slot name="actions" />
      <div class="flex items-center gap-3 border-l border-hairline pl-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        <span>{{ user?.email }}</span>
        <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal" @click="logout">
          Ieși
        </button>
      </div>
    </div>
  </div>
</template>
