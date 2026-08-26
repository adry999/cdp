<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const budgetKeys = ['under1k', '1to2k', '2to5k', 'over5k', 'unsure'] as const

const form = reactive({
  name: '',
  email: '',
  company: '',
  message: '',
  budget: '',
  source: '',
  website: '', // honeypot
})

const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const fieldErrors = reactive<{ name?: string; email?: string; message?: string }>({})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  fieldErrors.name = form.name.trim() ? undefined : t('home.contact.form.errorRequired')
  fieldErrors.email = !form.email.trim()
    ? t('home.contact.form.errorRequired')
    : EMAIL_RE.test(form.email)
      ? undefined
      : t('home.contact.form.errorEmail')
  fieldErrors.message = form.message.trim() ? undefined : t('home.contact.form.errorRequired')
  return !fieldErrors.name && !fieldErrors.email && !fieldErrors.message
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

function captureUtm(): Record<string, string> | undefined {
  const entries = UTM_KEYS.filter((key) => typeof route.query[key] === 'string').map((key) => [
    key,
    route.query[key] as string,
  ])
  return entries.length ? Object.fromEntries(entries) : undefined
}

async function handleSubmit() {
  if (!validate() || status.value === 'submitting') return
  status.value = 'submitting'
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: { ...form, lang: locale.value, page: route.fullPath, utm: captureUtm() },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <form
    v-if="status !== 'success'"
    class="mt-[clamp(28px,3vw,40px)] flex max-w-[560px] flex-col gap-4"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <input
      v-model="form.website"
      type="text"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      class="absolute -left-[9999px] h-0 w-0"
    />

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="lead-name">
        {{ t('home.contact.form.name') }}
      </label>
      <input
        id="lead-name"
        v-model="form.name"
        type="text"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
      />
      <p v-if="fieldErrors.name" class="mt-1 font-mono text-xs text-ink">{{ fieldErrors.name }}</p>
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="lead-email">
        {{ t('home.contact.form.email') }}
      </label>
      <input
        id="lead-email"
        v-model="form.email"
        type="email"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
      />
      <p v-if="fieldErrors.email" class="mt-1 font-mono text-xs text-ink">{{ fieldErrors.email }}</p>
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="lead-company">
        {{ t('home.contact.form.company') }}
      </label>
      <input
        id="lead-company"
        v-model="form.company"
        type="text"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
      />
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="lead-message">
        {{ t('home.contact.form.message') }}
      </label>
      <textarea
        id="lead-message"
        v-model="form.message"
        rows="4"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
      />
      <p v-if="fieldErrors.message" class="mt-1 font-mono text-xs text-ink">{{ fieldErrors.message }}</p>
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="lead-budget">
        {{ t('home.contact.form.budget') }}
      </label>
      <select
        id="lead-budget"
        v-model="form.budget"
        class="mt-2 w-full rounded border border-hairline bg-paper px-3.5 py-3 text-base outline-none focus:border-ink"
      >
        <option value="">{{ t('home.contact.form.budgetPlaceholder') }}</option>
        <option v-for="key in budgetKeys" :key="key" :value="key">
          {{ t(`home.contact.form.budgetOptions.${key}`) }}
        </option>
      </select>
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="lead-source">
        {{ t('home.contact.form.source') }}
      </label>
      <input
        id="lead-source"
        v-model="form.source"
        type="text"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
      />
    </div>

    <p v-if="status === 'error'" class="font-mono text-xs text-ink">{{ t('home.contact.form.error') }}</p>

    <p class="text-xs text-muted">
      {{ t('home.contact.form.privacyNotice') }}
      <NuxtLink :to="localePath('confidentialitate')" class="text-ink underline">{{
        t('home.contact.form.privacyNoticeLink')
      }}</NuxtLink>
    </p>

    <AppButton type="submit" variant="ink" class="w-fit text-center" :disabled="status === 'submitting'">
      {{ status === 'submitting' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}
    </AppButton>
  </form>
  <p v-else class="mt-[clamp(28px,3vw,40px)] max-w-[560px] text-base">{{ t('home.contact.form.success') }}</p>
</template>
