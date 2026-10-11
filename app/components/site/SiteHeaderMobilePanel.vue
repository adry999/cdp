<script setup lang="ts">
defineProps<{
  id: string
  groups: NavServiceGroup[]
  links: HeaderNavItem[]
  servicesTo: string
  servicesActive: boolean
  currentSlug: string | null
  /** See useContactCta: a homepage anchor, a link to /contact, or a button that opens the dialog. */
  ctaKind: ContactCtaKind
  ctaTo: string
}>()

const emit = defineEmits<{ close: []; contact: [] }>()
const { t } = useI18n()

const rowClass =
  'flex min-h-11 items-baseline gap-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink no-underline hover:text-ink'

const ctaClass =
  'sticky bottom-0 mt-auto flex min-h-14 w-full cursor-pointer border-0 items-center justify-between rounded bg-signal px-5 eyebrow text-[13px] font-semibold text-ink no-underline hover:text-ink hover:opacity-90'

function number(index: number): string {
  return String(index).padStart(2, '0')
}
</script>

<template>
  <div
    :id="id"
    class="fixed inset-0 -z-10 flex flex-col gap-7 overflow-y-auto bg-paper px-gutter pb-7 pt-[88px]"
  >
    <nav :aria-label="t('nav.main')" class="flex flex-col">
      <div class="flex flex-col gap-4 border-b border-hairline py-4">
        <NuxtLink
          :to="servicesTo"
          :class="rowClass"
          :aria-current="servicesActive ? 'page' : undefined"
          @click="emit('close')"
        >
          <span class="eyebrow font-normal" :class="servicesActive ? 'text-signal-text' : 'text-muted'">{{ number(1) }}</span>
          {{ t('nav.services') }}
        </NuxtLink>
        <div class="flex flex-col gap-3.5 pl-9">
          <div v-for="group in groups" :key="group.label" class="flex flex-col">
            <div class="pb-0.5 eyebrow-sm text-muted">{{ group.label }}</div>
            <NuxtLink
              v-for="service in group.services"
              :key="service.slug"
              :to="service.to"
              class="flex min-h-11 items-center text-[17px] leading-[1.3] no-underline hover:text-ink"
              :class="service.slug === currentSlug ? 'text-signal-text' : 'text-ink'"
              :aria-current="service.slug === currentSlug ? 'page' : undefined"
              @click="emit('close')"
            >
              {{ service.name }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <NuxtLink
        v-for="(link, index) in links"
        :key="link.id"
        :to="link.to"
        :class="rowClass"
        class="border-b border-hairline py-4"
        :aria-current="link.active ? 'page' : undefined"
        @click="emit('close')"
      >
        <span class="eyebrow font-normal" :class="link.active ? 'text-signal-text' : 'text-muted'">{{ number(index + 2) }}</span>
        {{ link.label }}
      </NuxtLink>
    </nav>

    <!-- One row, so the bottom CTA never has to cover the theme switch on short screens. -->
    <div class="flex items-center justify-between gap-4 border-b border-hairline">
      <SiteHeaderLocaleSwitch class="eyebrow gap-2.5 text-sm" />
      <CoreThemeToggle variant="row" />
    </div>

    <a v-if="ctaKind === 'anchor'" :href="ctaTo" :class="ctaClass" @click="emit('close')">
      {{ t('nav.letsTalk') }}
      <span aria-hidden="true">→</span>
    </a>
    <NuxtLink v-else-if="ctaKind === 'link'" :to="ctaTo" :class="ctaClass" @click="emit('close')">
      {{ t('nav.letsTalk') }}
      <span aria-hidden="true">→</span>
    </NuxtLink>
    <button v-else type="button" :class="ctaClass" aria-haspopup="dialog" @click="emit('contact')">
      {{ t('nav.letsTalk') }}
      <span aria-hidden="true">→</span>
    </button>
  </div>
</template>
