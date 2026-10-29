<script setup lang="ts">
definePageMeta({ layout: 'admin-auth', i18n: false })

const supabase = useSupabaseClient()
const code = ref('')
const error = ref('')
const loading = ref(false)
const preparing = ref(true)
const factorId = ref('')
const enroll = ref<{ qr: string; secret: string } | null>(null)
const regenerated = ref(false)

// Already verified in this session: the code screen has nothing left to do.
const existingSession = useSupabaseSession().value
if (existingSession && sessionAal(existingSession.access_token) === 'aal2') {
  await navigateTo('/admin/projects', { replace: true })
}

// Verified factor → ask for a code; none → enroll one first. Needs the browser client.
onMounted(async () => {
  const { data, error: listError } = await supabase.auth.mfa.listFactors()
  if (listError || !data) {
    error.value = 'Nu am putut încărca autentificarea în doi pași. Reîncarcă pagina.'
    preparing.value = false
    return
  }
  const verified = data.totp[0]
  if (verified) {
    factorId.value = verified.id
    preparing.value = false
    return
  }
  // An abandoned enrollment leaves an unverified factor behind; it would block a new one.
  const staleFactors = data.all.filter((f) => f.factor_type === 'totp' && f.status === 'unverified')
  for (const stale of staleFactors) {
    await supabase.auth.mfa.unenroll({ factorId: stale.id })
  }
  regenerated.value = staleFactors.length > 0
  const { data: created, error: enrollError } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Codepedia admin',
  })
  if (enrollError || !created) {
    error.value = 'Nu am putut pregăti codul QR. Reîncarcă pagina.'
  } else {
    factorId.value = created.id
    enroll.value = { qr: created.totp.qr_code, secret: created.totp.secret }
  }
  preparing.value = false
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
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
  // The verified (aal2) session is published through onAuthStateChange; make sure the
  // session ref holds it before the middleware checks the level on the next route.
  await supabase.auth.refreshSession()
  loading.value = false
  await navigateTo('/admin/projects', { replace: true })
}

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="w-full max-w-[380px]">
    <img src="/brand/codepedia-wordmark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 block h-[18px] w-auto dark:hidden" >
    <img src="/brand/codepedia-wordmark-on-dark.svg" alt="CODEPEDIA" width="183" height="18" class="mx-auto mb-8 hidden h-[18px] w-auto dark:block" >
    <form class="rounded border border-hairline p-7" @submit.prevent="handleSubmit">
      <template v-if="enroll">
        <p class="text-[15px]">
          Scanează codul cu Google Authenticator, 1Password sau o aplicație similară, apoi introdu codul de 6 cifre.
        </p>
        <p v-if="regenerated" role="note" class="mt-3 text-sm text-muted">
          Codul QR a fost regenerat — scanează-l din nou în aplicație.
        </p>
        <img :src="enroll.qr" alt="Cod QR pentru aplicația de autentificare" width="200" height="200" class="mx-auto mt-5 block h-[200px] w-[200px]" >
        <p class="mt-4 eyebrow text-muted">Cheie pentru introducere manuală</p>
        <p class="mt-1 select-all break-all font-mono text-[13px]">{{ enroll.secret }}</p>
      </template>
      <AdminField
        id="mfa-code"
        v-model="code"
        :class="enroll ? 'mt-5' : ''"
        label="Cod din aplicația de autentificare"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9 ]*"
        maxlength="7"
        autofocus
        required
      />
      <p v-if="error" class="mt-3 eyebrow text-signal-text">{{ error }}</p>
      <AppButton type="submit" variant="ink" class="mt-6 w-full text-center" :disabled="loading || preparing || !factorId">
        {{ loading ? 'Se verifică…' : 'Verifică' }}
      </AppButton>
    </form>
    <button type="button" class="mx-auto mt-5 block eyebrow text-muted underline" @click="signOut">Ieși</button>
  </div>
</template>
