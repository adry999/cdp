<script setup lang="ts">
import {
  offerKey,
  resolveRoute,
  type QualifierBudgetKey,
} from '#layers/qualifier/domain/routing'
import type { StageId } from '#layers/core/shared/types/service-stage'
import type { QualifierContactPayload } from '#layers/qualifier/domain/qualification'

const props = defineProps<{
  stage: StageId
  budget: QualifierBudgetKey
  submitting: boolean
  error: boolean
}>()
const emit = defineEmits<{ submit: [QualifierContactPayload]; back: [] }>()

const { t } = useI18n()
const localePath = useLocalePath()

const route = computed(() => resolveRoute(props.stage, props.budget))
const offer = computed(() => offerKey(props.stage, route.value))

const form = reactive<QualifierContactPayload>({
  name: '',
  email: '',
  handle: '',
  notes: '',
  website: '',
})

const fieldErrors = reactive<{ name?: string; email?: string }>({})

function validate() {
  fieldErrors.name = form.name.trim() ? undefined : t('home.contact.form.errorRequired')
  fieldErrors.email = !form.email.trim()
    ? t('home.contact.form.errorRequired')
    : EMAIL_PATTERN.test(form.email)
      ? undefined
      : t('home.contact.form.errorEmail')
  return !fieldErrors.name && !fieldErrors.email
}

function handleSubmit() {
  if (props.submitting || !validate()) return
  emit('submit', { ...form })
}
</script>

<template>
  <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
    <div class="rounded border border-hairline bg-hatch p-4">
      <p class="eyebrow-sm text-muted">
        {{ t(`qualifier.offer.${offer}.kicker`) }}
      </p>
      <p class="mt-1.5 text-[15px] font-medium leading-snug text-ink">
        {{ t(`qualifier.offer.${offer}.title`) }}
      </p>
      <p class="mt-1.5 text-[13px] leading-relaxed text-muted">
        {{ t(`qualifier.offer.${offer}.body`) }}
      </p>
    </div>

    <CoreHoneypotField v-model="form.website" />

    <div>
      <label class="block eyebrow text-muted" for="qual-name">
        {{ t('home.contact.form.name') }}
      </label>
      <input
        id="qual-name"
        v-model="form.name"
        type="text"
        required
        :aria-invalid="fieldErrors.name ? 'true' : undefined"
        :aria-describedby="fieldErrors.name ? 'qual-name-error' : undefined"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
      <p v-if="fieldErrors.name" id="qual-name-error" class="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink">
        <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ fieldErrors.name }}
      </p>
    </div>

    <div>
      <label class="block eyebrow text-muted" for="qual-email">
        {{ t('qualifier.contact.email') }}
      </label>
      <input
        id="qual-email"
        v-model="form.email"
        type="email"
        required
        autocomplete="email"
        :aria-invalid="fieldErrors.email ? 'true' : undefined"
        :aria-describedby="fieldErrors.email ? 'qual-email-error' : undefined"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
      <p v-if="fieldErrors.email" id="qual-email-error" class="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink">
        <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ fieldErrors.email }}
      </p>
    </div>

    <div>
      <label class="block eyebrow text-muted" for="qual-handle">
        {{ t('qualifier.contact.handle') }}
      </label>
      <input
        id="qual-handle"
        v-model="form.handle"
        type="text"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
    </div>

    <div>
      <label class="block eyebrow text-muted" for="qual-notes">
        {{ t('qualifier.contact.notes') }}
      </label>
      <textarea
        id="qual-notes"
        v-model="form.notes"
        rows="3"
        class="mt-2 w-full rounded border border-muted px-3.5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
    </div>

    <p v-if="error" role="alert" aria-live="polite" class="flex items-center gap-1.5 font-mono text-xs text-ink">
      <span aria-hidden="true" class="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />{{ t('home.contact.form.error') }}
    </p>

    <p class="text-xs text-muted">
      {{ t('home.contact.form.privacyNotice') }}
      <NuxtLink :to="localePath('confidentialitate')" class="text-ink underline">
        {{ t('home.contact.form.privacyNoticeLink') }}
      </NuxtLink>
    </p>

    <div class="flex items-center justify-between">
      <AppButton variant="outline" type="button" :disabled="submitting" @click="emit('back')">
        {{ t('qualifier.back') }}
      </AppButton>
      <AppButton variant="ink" type="submit" :disabled="submitting">
        {{ submitting ? t('home.contact.form.submitting') : t('qualifier.contact.submit') }}
      </AppButton>
    </div>
  </form>
</template>
