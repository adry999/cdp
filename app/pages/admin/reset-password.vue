<script setup lang="ts">
definePageMeta({ layout: 'admin-auth', i18n: false })

const MIN_PASSWORD_LENGTH = 10

const supabase = useSupabaseClient()
const password = ref('')
const confirmation = ref('')
const code = ref('')
const error = ref('')
const loading = ref(false)
const preparing = ref(true)
const linkInvalid = ref(false)
// Supabase refuses a password change on an aal1 session once TOTP is set up,
// so the code is asked here, before the change.
const factorId = ref('')

// The recovery link carries a one-time code; the browser client exchanges it for a session
// while it initializes, and getSession() waits for that. Needs the same browser that asked
// for the link (the PKCE verifier lives there).
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  const session = data.session
  if (!session) {
    linkInvalid.value = true
    preparing.value = false
    return
  }
  if (sessionAal(session.access_token) !== 'aal2') {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    factorId.value = factors?.totp[0]?.id ?? ''
  }
  preparing.value = false
})

async function handleSubmit() {
  error.value = ''
  if (password.value.length < MIN_PASSWORD_LENGTH) {
    error.value = `Parola trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.`
    return
  }
  if (password.value !== confirmation.value) {
    error.value = 'Parolele nu coincid.'
    return
  }
  loading.value = true
  if (factorId.value) {
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factorId.value,
      code: code.value.replace(/\s/g, ''),
    })
    if (verifyError) {
      loading.value = false
      error.value =
        verifyError.status === 429 ? 'Prea multe încercări. Așteaptă puțin și încearcă din nou.' : 'Cod greșit sau expirat.'
      return
    }
    // The session is aal2 now: if the update below fails, a retry must not ask for the code again.
    factorId.value = ''
  }
  const { error: updateError } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false
  if (updateError) {
    error.value =
      updateError.code === 'same_password'
        ? 'Parola nouă trebuie să difere de cea veche.'
        : updateError.code === 'weak_password'
          ? 'Parola e prea slabă sau a apărut într-o scurgere de date. Alege alta.'
          : 'Nu am putut schimba parola. Cere un link nou.'
    return
  }
  // /admin/mfa asks for the code when the session is still aal1, or forwards to the projects.
  await navigateTo('/admin/mfa', { replace: true })
}
</script>

<template>
  <div class="w-full max-w-[380px]">
    <img src="/brand/codepedia-wordmark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 block h-[18px] w-auto dark:hidden" >
    <img src="/brand/codepedia-wordmark-on-dark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 hidden h-[18px] w-auto dark:block" >
    <div v-if="linkInvalid" class="rounded border border-hairline p-7">
      <p class="text-[15px]">
        Linkul de resetare nu e valid sau a expirat. Cere unul nou și deschide-l în același browser.
      </p>
      <AppButton href="/admin/login" variant="ink" class="mt-6 w-full text-center">Înapoi la autentificare</AppButton>
    </div>
    <form v-else class="rounded border border-hairline p-7" @submit.prevent="handleSubmit">
      <AdminField
        id="new-password"
        v-model="password"
        label="Parolă nouă"
        type="password"
        autocomplete="new-password"
        :minlength="MIN_PASSWORD_LENGTH"
        required
      />
      <AdminField
        id="confirm-password"
        v-model="confirmation"
        class="mt-5"
        label="Repetă parola"
        type="password"
        autocomplete="new-password"
        required
      />
      <AdminField
        v-if="factorId"
        id="mfa-code"
        v-model="code"
        class="mt-5"
        label="Cod din aplicația de autentificare"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9 ]*"
        maxlength="7"
        required
      />
      <p v-if="error" class="mt-3 eyebrow text-signal-text">{{ error }}</p>
      <AppButton type="submit" variant="ink" class="mt-6 w-full text-center" :disabled="loading || preparing">
        {{ loading ? 'Se salvează…' : 'Salvează parola' }}
      </AppButton>
    </form>
  </div>
</template>
