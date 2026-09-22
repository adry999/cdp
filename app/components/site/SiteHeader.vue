<script setup lang="ts">
const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const { setLocaleOverride } = useLocaleOverride()

const menuOpen = ref(false)

type NavLink =
  | { kind: 'hash'; hash: string; label: string }
  | { kind: 'route'; routeName: string; label: string }

const navLinks: NavLink[] = [
  { kind: 'hash', hash: '#servicii', label: 'nav.services' },
  { kind: 'hash', hash: '#stack', label: 'nav.stack' },
  { kind: 'hash', hash: '#proces', label: 'nav.process' },
  { kind: 'hash', hash: '#proiecte', label: 'nav.work' },
  { kind: 'route', routeName: 'blog', label: 'nav.blog' },
  { kind: 'hash', hash: '#contact', label: 'nav.contact' },
]

function navLinkKey(link: NavLink): string {
  return link.kind === 'hash' ? link.hash : link.routeName
}

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
  <header class="sticky top-0 z-20 bg-paper">
    <div class="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-6 px-gutter">
      <NuxtLink :to="localePath('index')" aria-label="Codepedia" class="flex items-center">
        <img
          src="/brand/codepedia-wordmark.svg"
          alt="Codepedia"
          width="183"
          height="18"
          class="block h-[18px] w-auto"
        >
      </NuxtLink>

      <nav class="flex items-center gap-[clamp(14px,2vw,28px)] font-mono text-xs uppercase tracking-[0.08em]">
        <div class="hidden items-center gap-[clamp(14px,2vw,28px)] border-r border-hairline pr-[clamp(14px,2vw,28px)] nav:flex">
          <template v-for="link in navLinks" :key="navLinkKey(link)">
            <a v-if="link.kind === 'hash'" :href="link.hash" class="text-muted hover:text-signal">
              {{ t(link.label) }}
            </a>
            <NuxtLink v-else :to="localePath({ name: link.routeName })" class="text-muted hover:text-signal">
              {{ t(link.label) }}
            </NuxtLink>
          </template>
        </div>

        <span class="flex items-center gap-1.5">
          <NuxtLink
            :to="switchLocalePath('ro')"
            class="no-underline hover:no-underline"
            :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            @click="setLocaleOverride('ro')"
          >
            RO
          </NuxtLink>
          <span class="text-hairline">|</span>
          <NuxtLink
            :to="switchLocalePath('en')"
            class="no-underline hover:no-underline"
            :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            @click="setLocaleOverride('en')"
          >
            EN
          </NuxtLink>
        </span>

        <button
          type="button"
          class="flex h-11 w-11 cursor-pointer flex-col justify-center gap-[5px] rounded border border-hairline bg-transparent px-[11px] nav:hidden"
          :aria-label="t('nav.menu')"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="block h-px bg-ink" />
          <span class="block h-px" :class="menuOpen ? 'bg-signal' : 'bg-ink'" />
          <span class="block h-px bg-ink" />
        </button>
      </nav>
    </div>

    <div
      v-if="menuOpen"
      class="flex flex-col border-t border-hairline px-gutter pb-5 pt-2 font-mono text-xs uppercase tracking-[0.08em] nav:hidden"
    >
      <template v-for="(link, i) in navLinks" :key="navLinkKey(link)">
        <a
          v-if="link.kind === 'hash'"
          :href="link.hash"
          class="py-4"
          :class="[
            i === navLinks.length - 1 ? 'text-signal' : 'text-ink',
            { 'border-b border-hairline': i !== navLinks.length - 1 },
          ]"
          @click="menuOpen = false"
        >
          {{ t(link.label) }}
        </a>
        <NuxtLink
          v-else
          :to="localePath({ name: link.routeName })"
          class="py-4"
          :class="[
            i === navLinks.length - 1 ? 'text-signal' : 'text-ink',
            { 'border-b border-hairline': i !== navLinks.length - 1 },
          ]"
          @click="menuOpen = false"
        >
          {{ t(link.label) }}
        </NuxtLink>
      </template>
    </div>

    <div class="h-[2px] bg-signal" />
  </header>
</template>
