<script setup lang="ts">
import { MIN_ADMIN_PASSWORD_LENGTH, passwordMessage, passwordProblem } from '#layers/core/shared/utils/adminPassword'

definePageMeta({ layout: 'admin', i18n: false })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const password = ref('')
const confirmation = ref('')
const error = ref('')
const saved = ref(false)
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  saved.value = false
  const problem = passwordProblem(password.value, confirmation.value)
  if (problem) {
    error.value = passwordMessage(problem)
    return
  }
  loading.value = true
  // Every admin route runs on an aal2 session, which Supabase requires for a password change once TOTP is set up.
  const { error: updateError } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false
  if (updateError) {
    error.value = passwordMessage(updateError.code)
    return
  }
  password.value = ''
  confirmation.value = ''
  saved.value = true
}
</script>

<template>
  <div>
    <AdminTopbar title="Cont" />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <p class="eyebrow text-muted">Email</p>
      <p class="mt-1 text-[15px]">{{ user?.email }}</p>
      <p class="mt-5 eyebrow text-muted">Autentificare în doi pași</p>
      <p class="mt-1 text-[15px]">Activă (cod din aplicația de autentificare)</p>

      <form class="mt-8 max-w-[380px] border-t border-hairline pt-6" @submit.prevent="handleSubmit">
        <h2 class="m-0 text-[15px] font-medium">Schimbă parola</h2>
        <AdminField
          id="new-password"
          v-model="password"
          class="mt-5"
          label="Parolă nouă"
          type="password"
          autocomplete="new-password"
          :minlength="MIN_ADMIN_PASSWORD_LENGTH"
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
        <p v-if="error" role="alert" class="mt-3 eyebrow text-signal-text">{{ error }}</p>
        <p v-if="saved" role="status" class="mt-3 eyebrow text-signal-text">Parola a fost schimbată.</p>
        <AppButton type="submit" variant="ink" class="mt-6" :disabled="loading">
          {{ loading ? 'Se salvează…' : 'Salvează parola' }}
        </AppButton>
      </form>
    </div>
  </div>
</template>
