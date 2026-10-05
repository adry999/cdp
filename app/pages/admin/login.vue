<script setup lang="ts">
definePageMeta({ layout: 'admin-auth', i18n: false })

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
    <img src="/brand/codepedia-wordmark.svg" alt="Codepedia" width="183" height="18" class="mx-auto mb-8 block h-[18px] w-auto" >
    <form class="rounded border border-hairline p-7" @submit.prevent="handleSubmit">
      <AdminField id="email" v-model="email" label="Email" type="email" required />
      <AdminField id="password" v-model="password" class="mt-5" label="Parolă" type="password" required />
      <p v-if="error" class="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-signal">{{ error }}</p>
      <AppButton type="submit" variant="ink" class="mt-6 w-full text-center">
        {{ loading ? 'Se autentifică…' : 'Autentificare' }}
      </AppButton>
    </form>
  </div>
</template>
