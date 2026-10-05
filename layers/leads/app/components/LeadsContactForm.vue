<script setup lang="ts">
import { STAGE_ORDER, type StageId } from '#layers/core/shared/types/service-stage'
import { LEAD_BUDGET_KEYS, type ContactFieldErrors } from '#layers/leads/domain/lead'
import { useLeadSubmission } from '#layers/leads/state/useLeadSubmission'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { status, fieldErrors, submit } = useLeadSubmission()

const form = reactive({
  name: '',
  email: '',
  company: '',
  message: '',
  budget: '',
  stage: undefined as StageId | undefined,
  source: '',
  website: '', // honeypot
})

const ERROR_MESSAGE_KEYS = {
  required: 'home.contact.form.errorRequired',
  invalid_email: 'home.contact.form.errorEmail',
  invalid_stage: 'home.contact.form.error',
} as const

function fieldError(field: keyof ContactFieldErrors): string | undefined {
  const code = fieldErrors.value[field]
  return code ? t(ERROR_MESSAGE_KEYS[code]) : undefined
}

// Single-select, optional: picking the active chip again (or "Nu știu") clears it.
function toggleStage(stage: StageId | undefined) {
  form.stage = form.stage === stage ? undefined : stage
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

function captureUtm(): Record<string, string> | undefined {
  const entries = UTM_KEYS.filter((key) => typeof route.query[key] === 'string').map((key) => [
    key,
    route.query[key] as string,
  ])
  return entries.length ? Object.fromEntries(entries) : undefined
}

function handleSubmit() {
  return submit({ ...form, lang: locale.value, page: route.fullPath, utm: captureUtm() })
}

const successHeading = ref<HTMLElement | null>(null)

watch(status, (value) => {
  if (value === 'success') {
    nextTick(() => successHeading.value?.focus())
  }
})
</script>

<template>
  <form
    v-if="status !== 'success'"
    class="mt-[clamp(28px,3vw,40px)] flex max-w-[560px] flex-col gap-4"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <CoreHoneypotField v-model="form.website" />

    <div>
      <label class="block eyebrow text-muted" for="lead-name">
        {{ t('home.contact.form.name') }}
      </label>
      <input
        id="lead-name"
        v-model="form.name"
        type="text"
        required
        :aria-invalid="fieldError('name') ? 'true' : undefined"
        :aria-describedby="fieldError('name') ? 'lead-name-error' : undefined"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
      <p v-if="fieldError('name')" id="lead-name-error" class="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink">
        <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ fieldError('name') }}
      </p>
    </div>

    <div>
      <label class="block eyebrow text-muted" for="lead-email">
        {{ t('home.contact.form.email') }}
      </label>
      <input
        id="lead-email"
        v-model="form.email"
        type="email"
        required
        autocomplete="email"
        :aria-invalid="fieldError('email') ? 'true' : undefined"
        :aria-describedby="fieldError('email') ? 'lead-email-error' : undefined"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
      <p v-if="fieldError('email')" id="lead-email-error" class="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink">
        <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ fieldError('email') }}
      </p>
    </div>

    <div>
      <label class="block eyebrow text-muted" for="lead-company">
        {{ t('home.contact.form.company') }}
      </label>
      <input
        id="lead-company"
        v-model="form.company"
        type="text"
        autocomplete="organization"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
    </div>

    <div role="group" aria-labelledby="lead-stage-label">
      <div id="lead-stage-label" class="eyebrow text-muted">
        {{ t('home.contact.form.stage') }}
      </div>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <ToggleChip
          v-for="stage in STAGE_ORDER"
          :key="stage"
          size="form"
          :pressed="form.stage === stage"
          @click="toggleStage(stage)"
        >
          {{ t(`home.contact.form.stageOptions.${stage}`) }}
        </ToggleChip>
        <ToggleChip size="form" :pressed="form.stage === undefined" @click="form.stage = undefined">
          {{ t('home.contact.form.stageOptions.unsure') }}
        </ToggleChip>
      </div>
    </div>

    <div>
      <label class="block eyebrow text-muted" for="lead-message">
        {{ t('home.contact.form.message') }}
      </label>
      <textarea
        id="lead-message"
        v-model="form.message"
        rows="4"
        required
        :aria-invalid="fieldError('message') ? 'true' : undefined"
        :aria-describedby="fieldError('message') ? 'lead-message-error' : undefined"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
      <p v-if="fieldError('message')" id="lead-message-error" class="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink">
        <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ fieldError('message') }}
      </p>
    </div>

    <div>
      <label class="block eyebrow text-muted" for="lead-budget">
        {{ t('home.contact.form.budget') }}
      </label>
      <select
        id="lead-budget"
        v-model="form.budget"
        class="mt-2 w-full rounded border border-muted bg-paper px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <option value="">{{ t('home.contact.form.budgetPlaceholder') }}</option>
        <option v-for="key in LEAD_BUDGET_KEYS" :key="key" :value="key">
          {{ t(`home.contact.form.budgetOptions.${key}`) }}
        </option>
      </select>
    </div>

    <div>
      <label class="block eyebrow text-muted" for="lead-source">
        {{ t('home.contact.form.source') }}
      </label>
      <input
        id="lead-source"
        v-model="form.source"
        type="text"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
    </div>

    <p v-if="status === 'error'" role="alert" aria-live="polite" class="flex items-center gap-1.5 font-mono text-xs text-ink">
      <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ t('home.contact.form.error') }}
    </p>

    <p class="text-xs text-muted">
      {{ t('home.contact.form.privacyNotice') }}
      <NuxtLink :to="localePath('confidentialitate')" class="text-ink underline">{{
        t('home.contact.form.privacyNoticeLink')
      }}</NuxtLink>
    </p>

    <AppButton type="submit" variant="ink" class="w-fit text-center" :disabled="status === 'pending'">
      {{ status === 'pending' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}
    </AppButton>
  </form>
  <div v-else role="status" class="mt-[clamp(28px,3vw,40px)] max-w-[560px]">
    <p ref="successHeading" tabindex="-1" class="text-base outline-none">{{ t('home.contact.form.success') }}</p>
  </div>
</template>
