<script setup lang="ts">
import { useNavProjects } from '#layers/projects'
import { SERVICE_LINKS, SERVICE_NAV_INTRO } from '#layers/services'
import { visibleServices } from '#layers/core/shared/utils/visibleServices'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const getRouteBaseName = useRouteBaseName()
const { grantsEnabled } = useRuntimeConfig().public
const { navProjects } = useNavProjects()

const lang = computed<'ro' | 'en'>(() => (locale.value === 'en' ? 'en' : 'ro'))
const baseName = computed(() => {
  const name = getRouteBaseName(route)
  return typeof name === 'string' ? name : undefined
})
const activeId = computed(() => activeNavId(baseName.value))

const serviceGroups = computed<NavServiceGroup[]>(() => {
  const links = visibleServices(SERVICE_LINKS, grantsEnabled)
  return groupServiceLinks(links).map((group) => ({
    label: t(group.labelKey),
    services: group.links.map((link) => ({
      slug: link.slug,
      name: pick(link.name.ro, link.name.en, lang.value),
      intro: pick(SERVICE_NAV_INTRO[link.slug].ro, SERVICE_NAV_INTRO[link.slug].en, lang.value),
      to: localePath({ name: 'servicii-slug', params: { slug: link.routeSlug[lang.value] } }),
    })),
  }))
})
const currentSlug = computed(() => currentServiceSlug(SERVICE_LINKS, baseName.value, route.params.slug, lang.value))

const navItems = computed<HeaderNavItem[]>(() =>
  SITE_NAV_LINKS.map((link) => ({
    id: link.id,
    label: t(link.label),
    to: link.hash ? { path: localePath(link.routeName), hash: link.hash } : localePath(link.routeName),
    active: activeId.value === link.id,
  })),
)

// Homepage: scrolls to the contact section. Elsewhere: opens the contact dialog (or the qualifier).
const cta = useContactCta()
const ctaClass =
  'flex cursor-pointer items-center gap-2.5 whitespace-nowrap [font-family:inherit] text-[length:inherit] leading-[inherit] uppercase tracking-[inherit] rounded border border-ink px-3.5 py-[9px] font-semibold text-ink transition-colors hover:border-signal hover:bg-signal hover:text-ink'

const header = ref<HTMLElement | null>(null)
const menuToggle = ref<HTMLButtonElement | null>(null)
const menuOpen = ref(false)
const scrolled = ref(false)
const isArticle = computed(() => baseName.value === 'blog-slug')
const readProgress = useReadingProgress(isArticle)
const mobileMenuId = 'site-mobile-menu'
const { trapTab } = useFocusTrap(header)

function closeMenu({ returnFocus = false } = {}) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (returnFocus) menuToggle.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (!menuOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu({ returnFocus: true })
  } else {
    trapTab(event)
  }
}

// The panel's button disappears with the panel, so focus goes back to the menu toggle on close.
function onMobileContact() {
  closeMenu()
  cta.activate(menuToggle.value)
}

watch(() => route.fullPath, () => closeMenu())
watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 8
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  // Same width as the `nav:` variant (--breakpoint-nav in main.css).
  const wide = window.matchMedia('(min-width: 56.25rem)')
  const onWide = () => {
    if (wide.matches) closeMenu()
  }
  wide.addEventListener('change', onWide)

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    wide.removeEventListener('change', onWide)
    document.body.style.overflow = ''
  })
})
</script>

<template>
  <header
    ref="header"
    class="sticky top-0 z-30 bg-paper transition-shadow duration-200 motion-reduce:transition-none"
    :class="scrolled && 'shadow-header'"
    @keydown="onKeydown"
  >
    <div
      class="container-site flex items-center justify-between gap-6 transition-[height] duration-200 motion-reduce:transition-none"
      :class="scrolled ? 'h-[52px]' : 'h-16'"
    >
      <NuxtLink :to="localePath('index')" class="flex min-h-11 items-center">
        <img
          src="/brand/codepedia-wordmark.svg"
          alt="CODEPEDIA"
          width="183"
          height="18"
          class="block h-[18px] w-auto dark:hidden"
        >
        <img
          src="/brand/codepedia-wordmark-on-dark.svg"
          alt="CODEPEDIA"
          width="183"
          height="18"
          class="hidden h-[18px] w-auto dark:block"
        >
      </NuxtLink>

      <nav :aria-label="t('nav.main')" class="hidden items-center gap-[clamp(18px,2.4vw,32px)] eyebrow nav:flex">
        <div class="flex items-center gap-[clamp(16px,2.2vw,28px)]">
          <SiteHeaderServicesMenu
            :groups="serviceGroups"
            :projects-by-service="navProjects"
            :active="activeId === 'services'"
            :current-slug="currentSlug"
            :services-to="localePath('servicii')"
            :all-projects-to="localePath('proiecte')"
          />
          <NuxtLink
            v-for="item in navItems"
            :key="item.id"
            :to="item.to"
            class="group relative block py-2 hover:text-signal-text"
            :class="item.active ? 'text-ink' : 'text-muted'"
            :aria-current="item.active ? 'page' : undefined"
          >
            {{ item.label }}
            <span
              aria-hidden="true"
              class="absolute inset-x-0 bottom-0.5 h-0.5 origin-left bg-signal transition-transform duration-[250ms] motion-reduce:transition-none"
              :class="item.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'"
            />
          </NuxtLink>
        </div>

        <!-- A plain anchor on the homepage: a router link to the page you are on would be marked aria-current. -->
        <a v-if="cta.kind.value === 'anchor'" :href="cta.to.value" :class="ctaClass">
          {{ t('nav.letsTalk') }}
          <span aria-hidden="true">→</span>
        </a>
        <NuxtLink v-else-if="cta.kind.value === 'link'" :to="cta.to.value" :class="ctaClass">
          {{ t('nav.letsTalk') }}
          <span aria-hidden="true">→</span>
        </NuxtLink>
        <button v-else type="button" :class="ctaClass" aria-haspopup="dialog" @click="cta.activate($event.currentTarget as HTMLElement)">
          {{ t('nav.letsTalk') }}
          <span aria-hidden="true">→</span>
        </button>

        <SiteHeaderLocaleSwitch />

        <CoreThemeToggle class="-mx-1.5" />
      </nav>

      <button
        ref="menuToggle"
        type="button"
        class="-mr-2.5 flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] border-0 bg-transparent nav:hidden"
        :aria-label="t('nav.menu')"
        :aria-expanded="menuOpen"
        :aria-controls="mobileMenuId"
        @click="menuOpen = !menuOpen"
      >
        <span
          class="block h-0.5 w-[22px] bg-ink transition-transform duration-200 motion-reduce:transition-none"
          :class="menuOpen && 'translate-y-[7px] rotate-45'"
        />
        <span class="block h-0.5 w-[22px] bg-signal transition-opacity duration-200 motion-reduce:transition-none" :class="menuOpen && 'opacity-0'" />
        <span
          class="block h-0.5 w-[22px] bg-ink transition-transform duration-200 motion-reduce:transition-none"
          :class="menuOpen && '-translate-y-[7px] -rotate-45'"
        />
      </button>
    </div>

    <!-- Decorative: full width as the brand line, a reading-progress bar on blog articles. -->
    <div aria-hidden="true" class="h-0.5 w-full overflow-hidden" :class="isArticle && 'bg-hairline'">
      <div
        class="h-full w-full origin-left bg-signal"
        :style="isArticle ? { transform: `scaleX(${readProgress})` } : undefined"
      />
    </div>

    <LazySiteHeaderMobilePanel
      v-if="menuOpen"
      :id="mobileMenuId"
      class="nav:hidden"
      :groups="serviceGroups"
      :links="navItems"
      :services-to="localePath('servicii')"
      :services-active="activeId === 'services'"
      :current-slug="currentSlug"
      :cta-kind="cta.kind.value"
      :cta-to="cta.to.value"
      @close="closeMenu()"
      @contact="onMobileContact"
    />
  </header>
</template>
