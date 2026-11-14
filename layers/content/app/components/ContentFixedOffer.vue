<script setup lang="ts">
// The fixed-price offer for small businesses, as one callout: on the pricing page (anchor `#oferta`)
// and under the service stages on the homepage. Price, term and modules live in the locale files.
withDefaults(defineProps<{ headingTag?: 'h2' | 'h3'; detailsLink?: boolean }>(), {
  headingTag: 'h2',
  detailsLink: false,
})

const { t } = useI18n()
const localePath = useLocalePath()
const i18nList = useI18nList()
// Opens the contact dialog in place (the homepage contact section on the homepage).
const contact = useContactTrigger()

const facts = computed(() => i18nList('pricing.offer.facts'))
const detailsHref = computed(() => `${localePath('preturi')}#oferta`)
</script>

<template>
  <div class="flex flex-col gap-4 rounded border border-accent-border bg-accent-surface p-[clamp(20px,2.5vw,28px)]">
    <span class="eyebrow text-signal-text">
      <span aria-hidden="true">●</span> {{ t('pricing.offer.kicker') }}
    </span>
    <component
      :is="headingTag"
      class="m-0 max-w-[30ch] text-[clamp(20px,2.4vw,26px)] font-medium leading-[1.2] tracking-[-0.02em] text-pretty"
    >
      {{ t('pricing.offer.title') }}
    </component>
    <p class="m-0 max-w-[62ch] text-base text-muted text-pretty">{{ t('pricing.offer.body') }}</p>
    <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
      <li
        v-for="fact in facts"
        :key="fact"
        class="rounded border border-accent-border bg-paper px-[9px] py-[5px] eyebrow text-ink"
      >
        {{ fact }}
      </li>
    </ul>
    <div class="mt-1 flex flex-wrap items-center gap-5">
      <!-- Ink, not signal: the page already has its one signal button nearby. -->
      <AppButton
        :href="contact.href.value"
        :aria-haspopup="contact.opensDialog.value ? 'dialog' : undefined"
        @click.capture="contact.open($event)"
      >
        {{ t('pricing.offer.cta') }}
      </AppButton>
      <NuxtLink
        v-if="detailsLink"
        :to="detailsHref"
        class="tap-y eyebrow text-ink underline decoration-signal underline-offset-4 hover:text-signal-text"
      >
        {{ t('pricing.offer.details') }}
      </NuxtLink>
    </div>
  </div>
</template>
