<script setup lang="ts">
import { STAGE_ORDER, type StageId } from '#layers/core/shared/types/service-stage'
import { SERVICE_TAG_IDS, type ServiceTagId } from '#layers/core/shared/types/service-tag'
import { stageForServiceParam, stageForServiceTag } from '#layers/core/shared/utils/serviceStage'
import { LEAD_BUDGET_KEYS, type ContactFieldErrors } from '#layers/leads/domain/lead'
import { useLeadSubmission } from '#layers/leads/state/useLeadSubmission'

// `modal`: the dialog's compact layout (no "how did you hear" field, name and email side by side) with
// service chips instead of stage chips; `service` pre-selects one. The submission then carries that
// service and its qualifier stage. `page` keeps the stage chips, pre-selected from the
// `?serviciu=` / `?service=` link parameter.
const props = withDefaults(defineProps<{ variant?: 'page' | 'modal'; service?: ServiceTagId }>(), {
  variant: 'page',
  service: undefined,
})
const isModal = computed(() => props.variant === 'modal')

const { t, locale } = useI18n()
const { grantsEnabled } = useRuntimeConfig().public
const serviceOptions = SERVICE_TAG_IDS.filter((id) => id !== 'granturi' || grantsEnabled)
const route = useRoute()
const localePath = useLocalePath()
const { status, fieldErrors, submit } = useLeadSubmission()

const form = reactive({
  name: '',
  email: '',
  company: '',
  message: '',
  budget: '',
  // Blog CTAs link to /contact?serviciu=<slug> (RO) or ?service=<slug> (EN); unknown values are ignored.
  stage: stageForServiceParam(route.query.serviciu ?? route.query.service),
  service: props.service,
  source: '',
  website: '', // honeypot
})

const ERROR_MESSAGE_KEYS = {
  required: 'home.contact.form.errorRequired',
  invalid_email: 'home.contact.form.errorEmail',
  invalid_stage: 'home.contact.form.error',
  invalid_service: 'home.contact.form.error',
} as const

function fieldError(field: keyof ContactFieldErrors): string | undefined {
  const code = fieldErrors.value[field]
  return code ? t(ERROR_MESSAGE_KEYS[code]) : undefined
}

// Single-select, optional: picking the active chip again (or "Nu știu") clears it.
function toggleStage(stage: StageId | undefined) {
  form.stage = form.stage === stage ? undefined : stage
}

// Only fills an empty choice: a stage the visitor already picked is never overwritten.
watch(
  () => route.query.serviciu ?? route.query.service,
  (value) => {
    form.stage ??= stageForServiceParam(value)
  },
)

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

function captureUtm(): Record<string, string> | undefined {
  const entries = UTM_KEYS.filter((key) => typeof route.query[key] === 'string').map((key) => [
    key,
    route.query[key] as string,
  ])
  return entries.length ? Object.fromEntries(entries) : undefined
}

// Single-select, optional, like the stage chips.
function toggleService(service: ServiceTagId | undefined) {
  form.service = form.service === service ? undefined : service
}

const FIELD_ORDER = ['name', 'email', 'message'] as const

async function handleSubmit() {
  const { stage, service, ...fields } = form
  const choice = isModal.value
    ? { service, stage: service ? stageForServiceTag(service) : undefined }
    : { stage }
  await submit({ ...fields, ...choice, lang: locale.value, page: route.fullPath, utm: captureUtm() })
  // A rejected submit leaves focus on the button; moving it to the first invalid field puts
  // the error in front of a screen-reader user (their message is linked by aria-describedby).
  const invalid = FIELD_ORDER.find((field) => fieldErrors.value[field])
  if (invalid) {
    await nextTick()
    document.getElementById(`lead-${invalid}`)?.focus()
  }
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
    class="flex flex-col"
    :class="isModal ? 'gap-4' : 'mt-[clamp(28px,3vw,40px)] max-w-[560px] gap-6'"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <CoreHoneypotField v-model="form.website" />

    <div :class="isModal ? 'grid grid-fit-safe-220 gap-4' : 'flex flex-col gap-6'">
      <div>
        <label class="block eyebrow text-muted" for="lead-name">
          {{ t('home.contact.form.name') }}
        </label>
        <input
          id="lead-name"
          v-model="form.name"
          autocomplete="name"
          type="text"
          required
          :aria-invalid="fieldError('name') ? 'true' : undefined"
          :aria-describedby="fieldError('name') ? 'lead-name-error' : undefined"
          class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
          class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
        <p v-if="fieldError('email')" id="lead-email-error" class="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink">
          <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ fieldError('email') }}
        </p>
      </div>

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
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
    </div>

    <div v-if="isModal" role="group" aria-labelledby="lead-service-label">
      <div id="lead-service-label" class="eyebrow text-muted">
        {{ t('home.contact.form.service') }}
      </div>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <ToggleChip
          v-for="option in serviceOptions"
          :key="option"
          size="form"
          :pressed="form.service === option"
          @click="toggleService(option)"
        >
          {{ t(`home.contact.form.serviceOptions.${option}`) }}
        </ToggleChip>
        <ToggleChip size="form" :pressed="form.service === undefined" @click="form.service = undefined">
          {{ t('home.contact.form.serviceOptions.unsure') }}
        </ToggleChip>
      </div>
    </div>

    <div v-else role="group" aria-labelledby="lead-stage-label">
      <div id="lead-stage-label" class="eyebrow text-muted">
        {{ t('home.contact.form.stage') }}
      </div>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <ToggleChip
          v-for="option in STAGE_ORDER"
          :key="option"
          size="form"
          :pressed="form.stage === option"
          @click="toggleStage(option)"
        >
          {{ t(`home.contact.form.stageOptions.${option}`) }}
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
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
        class="mt-2 w-full rounded border border-muted bg-paper px-3.5 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <option value="">{{ t('home.contact.form.budgetPlaceholder') }}</option>
        <option v-for="key in LEAD_BUDGET_KEYS" :key="key" :value="key">
          {{ t(`home.contact.form.budgetOptions.${key}`) }}
        </option>
      </select>
    </div>

    <div v-if="!isModal">
      <label class="block eyebrow text-muted" for="lead-source">
        {{ t('home.contact.form.source') }}
      </label>
      <input
        id="lead-source"
        v-model="form.source"
        type="text"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
    </div>

    <p v-if="status === 'error'" role="alert" class="flex items-center gap-1.5 font-mono text-xs text-ink">
      <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ t('home.contact.form.error') }}
    </p>

    <div class="flex flex-col gap-4" :class="isModal && 'sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'">
      <p class="m-0 text-xs text-muted" :class="isModal && 'max-w-[34ch]'">
        {{ t('home.contact.form.privacyNotice') }}
        <NuxtLink :to="localePath('confidentialitate')" class="text-ink underline">{{
          t('home.contact.form.privacyNoticeLink')
        }}</NuxtLink>
      </p>

      <AppButton
        type="submit"
        :variant="isModal ? 'signal' : 'ink'"
        class="w-fit text-center"
        :class="isModal && 'leading-[17px]'"
        :aria-disabled="status === 'pending' ? 'true' : undefined"
      >
        {{ status === 'pending' ? t('home.contact.form.submitting') : t('home.contact.form.submit') }}
      </AppButton>
    </div>
  </form>
  <slot v-else name="success">
    <div role="status" class="mt-[clamp(28px,3vw,40px)] max-w-[560px]">
      <p ref="successHeading" tabindex="-1" class="text-base outline-none">{{ t('home.contact.form.success') }}</p>
    </div>
  </slot>
</template>
