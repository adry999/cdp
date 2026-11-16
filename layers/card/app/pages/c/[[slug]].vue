<script setup lang="ts">
import { DEFAULT_CARD_SLUG, TEAM, useSiteSettings } from '#layers/content'
import { mapProjectCard, selectHomeProjects, usePublishedProjects, type ProjectCardRow } from '#layers/projects'
import { useQualifierAvailability } from '#layers/qualifier'
import { cardSource, findCardMember, telegramUrl, whatsappUrl } from '#layers/card/domain/cardProfile'
import { CARD_ICONS, SOCIAL_LABELS, socialNetworkOf } from '#layers/card/domain/icons'
import { useCardTracking } from '#layers/card/state/useCardTracking'

// The page a printed business card's QR opens: codepedia.md/c (the default person) or /c/<slug>.
// The card prints only this URL; numbers and links come from layers/content/data/team.ts, so they
// change without a reprint. An optional `?s=<word>` names where the QR was printed and travels
// with any request sent from here (see README).
definePageMeta({ layout: 'bare' })

const CARD_PROJECT_COUNT = 2

const { t } = useI18n()
const route = useRoute()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()
const settings = useSiteSettings()
const siteUrl = useSiteUrl()
const { isQualifierEnabled } = useQualifierAvailability()

const slug = computed(() => (typeof route.params.slug === 'string' ? route.params.slug : undefined))
const found = findCardMember(TEAM, slug.value, DEFAULT_CARD_SLUG)
if (!found) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
const member = found

// The contact is what the page is for: a failing database drops the projects, never the page.
const rows = shallowRef<ProjectCardRow[]>([])
try {
  rows.value = (await usePublishedProjects()).projects.value ?? []
} catch (error) {
  console.warn('[card] projects unavailable, page shown without them', error)
}
const projects = computed(() =>
  selectHomeProjects(rows.value)
    .slice(0, CARD_PROJECT_COUNT)
    .map((row) => mapProjectCard(row, siteLocale.value)),
)

const source = computed(() => cardSource(route.query.s))
const { track } = useCardTracking(member.card.slug, () => source.value)
const vcardHref = computed(() => `/vcard/${member.card.slug}.vcf${siteLocale.value === 'en' ? '?lang=en' : ''}`)
// Used only while the qualifier is off: the contact form stores utm_* with the lead.
const contactHref = computed(() =>
  localePath({
    name: 'contact',
    query: { utm_source: 'qr', utm_campaign: member.card.slug, ...(source.value ? { utm_medium: source.value } : {}) },
  }),
)

const chats = computed(() => [
  ...(member.card.whatsapp ? [{ key: 'whatsapp' as const, href: whatsappUrl(member.card.whatsapp), icon: CARD_ICONS.whatsapp, label: t('card.whatsapp') }] : []),
  ...(member.card.telegram ? [{ key: 'telegram' as const, href: telegramUrl(member.card.telegram), icon: CARD_ICONS.telegram, label: t('card.telegram') }] : []),
])

const socials = computed(() =>
  settings.value.socialProfiles.flatMap((url) => {
    const network = socialNetworkOf(url)
    return network ? [{ url, label: SOCIAL_LABELS[network] }] : []
  }),
)
const siteHost = computed(() => new URL(siteUrl).host.replace(/^www\./, ''))

usePageSeo({
  title: () => member.name,
  description: () => t('card.seo.description', { name: member.name }),
})
// Reached from a printed card, not from search: kept out of the index and out of the sitemap.
useSeoMeta({ robots: 'noindex, follow' })
</script>

<template>
  <div class="mx-auto max-w-[480px] px-gutter pb-12 pt-6">
    <div class="flex items-center justify-between gap-4 border-b border-hairline pb-5">
      <NuxtLink :to="localePath('index')" class="flex min-h-11 items-center">
        <img src="/brand/codepedia-wordmark.svg" alt="CODEPEDIA" width="183" height="18" class="block h-4 w-auto dark:hidden">
        <img src="/brand/codepedia-wordmark-on-dark.svg" alt="CODEPEDIA" width="183" height="18" class="hidden h-4 w-auto dark:block">
      </NuxtLink>
      <span class="eyebrow-sm text-muted">{{ t('card.tagline') }}</span>
    </div>

    <div class="mt-7 flex items-center gap-5">
      <div class="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[14px] bg-ink" aria-hidden="true">
        <img src="/brand/codepedia-mark-inverse.svg" alt="" width="414" height="265" class="block h-auto w-[46px] dark:hidden">
        <img src="/brand/codepedia-mark.svg" alt="" width="414" height="265" class="hidden h-auto w-[46px] dark:block">
      </div>
      <div class="min-w-0">
        <h1 class="m-0 text-[clamp(30px,9vw,40px)] font-semibold leading-[1.05] tracking-[-0.03em]">{{ member.name }}</h1>
        <p class="m-0 mt-2 font-mono text-[13px] tracking-[0.04em] text-muted">{{ t('card.studio') }}</p>
      </div>
    </div>

    <a
      :href="vcardHref"
      class="mt-7 flex min-h-[60px] items-center justify-center gap-3 rounded bg-signal px-5 text-[17px] font-semibold text-on-signal no-underline transition-colors duration-[120ms] hover:bg-ink hover:text-paper hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      @click="track('save')"
    >
      <Icon :name="CARD_ICONS.save" class="h-5 w-5" aria-hidden="true" />
      {{ t('card.saveContact') }}
    </a>

    <ul v-if="chats.length" :aria-label="t('card.chat')" class="m-0 mt-3 grid list-none grid-cols-2 gap-3 p-0">
      <li v-for="chat in chats" :key="chat.key">
        <a
          :href="chat.href"
          target="_blank"
          rel="noopener"
          class="flex min-h-[60px] items-center justify-center gap-2.5 rounded border border-ink px-3 text-[17px] text-ink no-underline transition-colors duration-[120ms] hover:border-muted hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          @click="track(chat.key)"
        >
          <Icon :name="chat.icon" class="h-5 w-5" aria-hidden="true" />
          {{ chat.label }}
        </a>
      </li>
    </ul>

    <p class="m-0 mt-9 eyebrow-sm text-muted">{{ t('card.projectPrompt') }}</p>
    <QualifierCta
      variant="outline"
      :fallback-href="contactHref"
      class="mt-3 flex! min-h-[60px] w-full items-center gap-3 text-left text-[17px]"
      @click="track('budget')"
    >
      <Icon :name="isQualifierEnabled ? CARD_ICONS.budget : CARD_ICONS.write" class="h-5 w-5 shrink-0" aria-hidden="true" />
      <span class="flex-1">{{ isQualifierEnabled ? t('card.budget') : t('card.writeUs') }}</span>
      <Icon :name="CARD_ICONS.arrow" class="h-4 w-4 shrink-0 text-signal-text" aria-hidden="true" />
    </QualifierCta>

    <section v-if="projects.length" class="mt-9" aria-labelledby="card-projects">
      <div class="flex items-baseline justify-between border-b border-ink pb-2.5">
        <h2 id="card-projects" class="m-0 eyebrow-sm font-normal text-muted">{{ t('card.projects') }}</h2>
        <NuxtLink :to="localePath('proiecte')" class="eyebrow-sm text-signal-text no-underline hover:underline">
          {{ t('card.allProjects') }} →
        </NuxtLink>
      </div>
      <ul class="m-0 list-none p-0">
        <li v-for="project in projects" :key="project.slug" class="border-b border-hairline">
          <NuxtLink
            :to="localePath({ name: 'proiecte-slug', params: { slug: project.slug } })"
            class="group grid grid-cols-[clamp(112px,32vw,148px)_1fr] items-center gap-4 py-4 text-ink no-underline hover:no-underline"
          >
            <MediaFrame ratio="16/10" :src="project.coverPath ?? undefined" :alt="project.coverAlt" sizes="320:296px" />
            <span class="min-w-0">
              <span class="block eyebrow-sm text-muted">{{ project.kind }}</span>
              <span class="mt-1.5 block text-[17px] font-medium leading-[1.25] transition-colors duration-[120ms] group-hover:text-signal-text">
                {{ project.title }}
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <nav :aria-label="t('card.links')" class="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-[13px]">
      <NuxtLink :to="localePath('index')" class="text-ink underline decoration-signal decoration-2 underline-offset-[5px] hover:decoration-ink">
        {{ siteHost }}
      </NuxtLink>
      <span class="flex gap-4">
        <a v-for="social in socials" :key="social.url" :href="social.url" target="_blank" rel="noopener" class="text-muted no-underline hover:text-ink">
          {{ social.label }}
        </a>
      </span>
    </nav>
  </div>
</template>
