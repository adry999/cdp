<script setup lang="ts">
import {
  offerKey,
  resolveRoute,
  type QualifierBudgetKey,
  type StageId,
} from '~~/shared/utils/qualifierRouting'

export interface QualifierContactPayload {
  name: string
  email: string
  handle: string
  notes: string
  website: string // honeypot
}

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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  fieldErrors.name = form.name.trim() ? undefined : t('home.contact.form.errorRequired')
  fieldErrors.email = !form.email.trim()
    ? t('home.contact.form.errorRequired')
    : EMAIL_RE.test(form.email)
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
      <p class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
        {{ t(`qualifier.offer.${offer}.kicker`) }}
      </p>
      <p class="mt-1.5 text-[15px] font-medium leading-snug text-ink">
        {{ t(`qualifier.offer.${offer}.title`) }}
      </p>
      <p class="mt-1.5 text-[13px] leading-relaxed text-muted">
        {{ t(`qualifier.offer.${offer}.body`) }}
      </p>
    </div>

    <input
      v-model="form.website"
      type="text"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      class="absolute -left-[9999px] h-0 w-0"
    >

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="qual-name">
        {{ t('home.contact.form.name') }}
      </label>
      <input
        id="qual-name"
        v-model="form.name"
        type="text"
        required
        :aria-invalid="!!fieldErrors.name"
        :aria-describedby="fieldErrors.name ? 'qual-name-error' : undefined"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-signal"
      >
      <p v-if="fieldErrors.name" id="qual-name-error" class="mt-1 font-mono text-xs text-signal">
        {{ fieldErrors.name }}
      </p>
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="qual-email">
        {{ t('qualifier.contact.email') }}
      </label>
      <input
        id="qual-email"
        v-model="form.email"
        type="email"
        required
        autocomplete="email"
        :aria-invalid="!!fieldErrors.email"
        :aria-describedby="fieldErrors.email ? 'qual-email-error' : undefined"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-signal"
      >
      <p v-if="fieldErrors.email" id="qual-email-error" class="mt-1 font-mono text-xs text-signal">
        {{ fieldErrors.email }}
      </p>
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="qual-handle">
        {{ t('qualifier.contact.handle') }}
      </label>
      <input
        id="qual-handle"
        v-model="form.handle"
        type="text"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-signal"
      >
    </div>

    <div>
      <label class="block font-mono text-xs uppercase tracking-[0.08em] text-muted" for="qual-notes">
        {{ t('qualifier.contact.notes') }}
      </label>
      <textarea
        id="qual-notes"
        v-model="form.notes"
        rows="3"
        class="mt-2 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-signal"
      />
    </div>

    <p v-if="error" role="alert" aria-live="polite" class="font-mono text-xs text-signal">
      {{ t('home.contact.form.error') }}
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
