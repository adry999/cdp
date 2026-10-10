<script setup lang="ts">
defineProps<{
  id: string
  groups: NavServiceGroup[]
  links: HeaderNavItem[]
  servicesTo: string
  servicesActive: boolean
  currentSlug: string | null
  ctaTo: string
  /** Homepage: a plain anchor to the contact section, so the router does not mark it as the current page. */
  ctaIsAnchor: boolean
}>()

const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

const rowClass =
  'flex items-baseline gap-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink no-underline hover:text-ink'

const ctaClass =
  'mt-auto flex min-h-14 items-center justify-between rounded bg-signal px-5 eyebrow font-semibold text-paper no-underline hover:text-paper hover:opacity-90'

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

    <SiteHeaderLocaleSwitch class="eyebrow gap-2.5 text-sm" />

    <a v-if="ctaIsAnchor" :href="ctaTo" :class="ctaClass" @click="emit('close')">
      {{ t('nav.letsTalk') }}
      <span aria-hidden="true">→</span>
    </a>
    <NuxtLink v-else :to="ctaTo" :class="ctaClass" @click="emit('close')">
      {{ t('nav.letsTalk') }}
      <span aria-hidden="true">→</span>
    </NuxtLink>
  </div>
</template>
