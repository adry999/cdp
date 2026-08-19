<script setup lang="ts">
definePageMeta({ layout: 'admin-auth' })

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  loading.value = false
  if (authError) {
    error.value = 'Email sau parolă greșită.'
    return
  }
  await navigateTo('/admin/projects')
}
</script>

<template>
  <div class="w-full max-w-[380px]">
    <img src="/brand/codepedia-wordmark.svg" alt="Codepedia" width="183" height="18" class="mx-auto mb-8 block h-[18px] w-auto" />
    <form class="rounded border border-hairline p-7" @submit.prevent="handleSubmit">
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
      />
      <label class="mt-5 block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="password">Parolă</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
      />
      <p v-if="error" class="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-signal">{{ error }}</p>
      <AppButton type="submit" variant="ink" class="mt-6 w-full text-center">
        {{ loading ? 'Se autentifică…' : 'Autentificare' }}
      </AppButton>
    </form>
  </div>
</template>
