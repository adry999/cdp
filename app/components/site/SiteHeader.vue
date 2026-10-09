<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const { setLocaleOverride } = useLocaleOverride()
const route = useRoute()
const getRouteBaseName = useRouteBaseName()

const menuOpen = ref(false)
const menuToggle = ref<HTMLButtonElement | null>(null)
const mobileMenuId = 'site-mobile-menu'

const navLinks = computed(() => (getRouteBaseName(route) === 'index' ? HOME_NAV_LINKS : PAGE_NAV_LINKS))

function isCtaLink(link: SiteNavLink): boolean {
  return link.kind === 'hash' ? link.hash === '#contact' : link.routeName === 'contact'
}

function navLinkKey(link: SiteNavLink): string {
  return link.kind === 'hash' ? link.hash : link.routeName
}

function closeMenu({ returnFocus = false } = {}) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (returnFocus) menuToggle.value?.focus()
}

function toggleMenu() {
  if (menuOpen.value) {
    closeMenu({ returnFocus: true })
  } else {
    menuOpen.value = true
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && menuOpen.value) {
    event.preventDefault()
    closeMenu({ returnFocus: true })
  }
}

watch(() => route.fullPath, () => closeMenu())

onMounted(() => {
  const mq = window.matchMedia('(min-width: 821px)')
  const close = () => {
    if (mq.matches) menuOpen.value = false
  }
  mq.addEventListener('change', close)
  onUnmounted(() => mq.removeEventListener('change', close))
})
</script>

<template>
  <header class="sticky top-0 z-20 bg-paper" @keydown="onMenuKeydown">
    <div class="container-site flex min-h-16 items-center justify-between gap-6">
      <NuxtLink :to="localePath('index')" class="flex items-center">
        <img
          src="/brand/codepedia-wordmark.svg"
          alt="CODEPEDIA"
          width="183"
          height="18"
          class="block h-[18px] w-auto"
        >
      </NuxtLink>

      <nav :aria-label="t('nav.main')" class="flex items-center gap-[clamp(14px,2vw,28px)] eyebrow">
        <div class="hidden items-center gap-[clamp(14px,2vw,28px)] border-r border-hairline pr-[clamp(14px,2vw,28px)] nav:flex">
          <template v-for="link in navLinks" :key="navLinkKey(link)">
            <a v-if="link.kind === 'hash'" :href="`${localePath('index')}${link.hash}`" class="text-muted hover:text-signal-text">
              {{ t(link.label) }}
            </a>
            <NuxtLink v-else :to="localePath({ name: link.routeName })" class="text-muted hover:text-signal-text">
              {{ t(link.label) }}
            </NuxtLink>
          </template>
        </div>

        <span class="flex items-center gap-1.5">
          <!-- SwitchLocalePathLink, not NuxtLink + switchLocalePath(): the header
               renders before the page sets its localized slug, and only this
               component's href is rewritten after the page renders on the server. -->
          <SwitchLocalePathLink
            locale="ro"
            hreflang="ro"
            lang="ro"
            class="no-underline hover:no-underline"
            :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            :aria-current="locale === 'ro' ? 'true' : undefined"
            @click="setLocaleOverride('ro')"
          >
            RO
          </SwitchLocalePathLink>
          <span class="text-hairline">|</span>
          <SwitchLocalePathLink
            locale="en"
            hreflang="en"
            lang="en"
            class="no-underline hover:no-underline"
            :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            :aria-current="locale === 'en' ? 'true' : undefined"
            @click="setLocaleOverride('en')"
          >
            EN
          </SwitchLocalePathLink>
        </span>

        <button
          ref="menuToggle"
          type="button"
          class="flex h-11 w-11 cursor-pointer flex-col justify-center gap-[5px] rounded border border-hairline bg-transparent px-[11px] nav:hidden"
          :aria-label="t('nav.menu')"
          :aria-expanded="menuOpen"
          :aria-controls="mobileMenuId"
          @click="toggleMenu"
        >
          <span class="block h-px bg-ink" />
          <span class="block h-px" :class="menuOpen ? 'bg-signal' : 'bg-ink'" />
          <span class="block h-px bg-ink" />
        </button>
      </nav>
    </div>

    <div
      v-if="menuOpen"
      :id="mobileMenuId"
      class="flex flex-col border-t border-hairline px-gutter pb-5 pt-2 eyebrow nav:hidden"
    >
      <template v-for="(link, i) in navLinks" :key="navLinkKey(link)">
        <a
          v-if="link.kind === 'hash'"
          :href="`${localePath('index')}${link.hash}`"
          class="py-4"
          :class="[
            isCtaLink(link) ? 'text-ink underline decoration-signal underline-offset-4' : 'text-ink',
            { 'border-b border-hairline': i !== navLinks.length - 1 },
          ]"
          @click="closeMenu()"
        >
          {{ t(link.label) }}
        </a>
        <NuxtLink
          v-else
          :to="localePath({ name: link.routeName })"
          class="py-4"
          :class="[
            isCtaLink(link) ? 'text-ink underline decoration-signal underline-offset-4' : 'text-ink',
            { 'border-b border-hairline': i !== navLinks.length - 1 },
          ]"
          @click="closeMenu()"
        >
          {{ t(link.label) }}
        </NuxtLink>
      </template>
    </div>

    <div class="h-[2px] bg-signal" />
  </header>
</template>
