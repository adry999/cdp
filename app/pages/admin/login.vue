<script setup lang="ts">
definePageMeta({ layout: 'admin-auth', i18n: false })

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// An admin who is already signed in has nothing to do on this page.
const existingSession = useSupabaseSession().value
if (existingSession) {
  await navigateTo(sessionAal(existingSession.access_token) === 'aal2' ? '/admin/projects' : '/admin/mfa')
}

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
  await navigateTo('/admin/mfa')
}
</script>

<template>
  <div class="w-full max-w-[380px]">
    <img src="/brand/codepedia-wordmark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 block h-[18px] w-auto dark:hidden" >
    <img src="/brand/codepedia-wordmark-on-dark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 hidden h-[18px] w-auto dark:block" >
    <form class="rounded border border-hairline p-7" @submit.prevent="handleSubmit">
      <AdminField id="email" v-model="email" label="Email" type="email" autocomplete="email" required />
      <AdminField id="password" v-model="password" class="mt-5" label="Parolă" type="password" autocomplete="current-password" required />
      <p v-if="error" class="mt-3 eyebrow text-signal-text">{{ error }}</p>
      <AppButton type="submit" variant="ink" class="mt-6 w-full text-center" :disabled="loading">
        {{ loading ? 'Se autentifică…' : 'Autentificare' }}
      </AppButton>
    </form>
  </div>
</template>
