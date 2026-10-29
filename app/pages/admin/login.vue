<script setup lang="ts">
definePageMeta({ layout: 'admin-auth', i18n: false })

const supabase = useSupabaseClient()
const requestUrl = useRequestURL()
const email = ref('')
const password = ref('')
const error = ref('')
const notice = ref('')
const loading = ref(false)
const forgot = ref(false)

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

async function handleReset() {
  error.value = ''
  loading.value = true
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${requestUrl.origin}/admin/reset-password`,
  })
  loading.value = false
  if (resetError) {
    error.value =
      resetError.status === 429 ? 'Prea multe cereri. Așteaptă puțin și încearcă din nou.' : 'Nu am putut trimite emailul.'
    return
  }
  // Same answer whether the address has an account or not.
  notice.value = 'Dacă adresa are cont, vei primi un email cu linkul de resetare. Deschide-l în acest browser.'
}

function toggleForgot() {
  forgot.value = !forgot.value
  error.value = ''
  notice.value = ''
}
</script>

<template>
  <div class="w-full max-w-[380px]">
    <img src="/brand/codepedia-wordmark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 block h-[18px] w-auto dark:hidden" >
    <img src="/brand/codepedia-wordmark-on-dark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 hidden h-[18px] w-auto dark:block" >
    <form v-if="forgot" class="rounded border border-hairline p-7" @submit.prevent="handleReset">
      <AdminField id="email" v-model="email" label="Email" type="email" autocomplete="email" required />
      <p v-if="error" class="mt-3 eyebrow text-signal-text">{{ error }}</p>
      <p v-if="notice" role="status" class="mt-3 text-sm text-muted">{{ notice }}</p>
      <AppButton type="submit" variant="ink" class="mt-6 w-full text-center" :disabled="loading || !!notice">
        {{ loading ? 'Se trimite…' : 'Trimite linkul de resetare' }}
      </AppButton>
    </form>
    <form v-else class="rounded border border-hairline p-7" @submit.prevent="handleSubmit">
      <AdminField id="email" v-model="email" label="Email" type="email" autocomplete="email" required />
      <AdminField id="password" v-model="password" class="mt-5" label="Parolă" type="password" autocomplete="current-password" required />
      <p v-if="error" class="mt-3 eyebrow text-signal-text">{{ error }}</p>
      <AppButton type="submit" variant="ink" class="mt-6 w-full text-center" :disabled="loading">
        {{ loading ? 'Se autentifică…' : 'Autentificare' }}
      </AppButton>
    </form>
    <button type="button" class="mx-auto mt-5 block eyebrow text-muted underline" @click="toggleForgot">
      {{ forgot ? 'Înapoi la autentificare' : 'Ai uitat parola?' }}
    </button>
  </div>
</template>
