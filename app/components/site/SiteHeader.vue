<script setup lang="ts">
const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const menuOpen = ref(false)

const navLinks = [
  { hash: '#servicii', label: 'nav.services' },
  { hash: '#stack', label: 'nav.stack' },
  { hash: '#proces', label: 'nav.process' },
  { hash: '#proiecte', label: 'nav.work' },
  { hash: '#contact', label: 'nav.contact' },
] as const

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
  <header class="sticky top-0 z-20 border-b border-hairline bg-paper">
    <div class="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-6 px-gutter">
      <NuxtLink :to="localePath('index')" aria-label="Codepedia" class="flex items-center">
        <img
          src="/brand/codepedia-wordmark.svg"
          alt="Codepedia"
          width="183"
          height="18"
          class="block h-[18px] w-auto"
        />
      </NuxtLink>

      <nav class="flex items-center gap-[clamp(14px,2vw,28px)] font-mono text-xs uppercase tracking-[0.08em]">
        <div class="hidden items-center gap-[clamp(14px,2vw,28px)] border-r border-hairline pr-[clamp(14px,2vw,28px)] nav:flex">
          <a v-for="link in navLinks" :key="link.hash" :href="link.hash" class="text-muted">
            {{ t(link.label) }}
          </a>
        </div>

        <span class="flex items-center gap-1.5">
          <NuxtLink
            :to="switchLocalePath('ro')"
            class="no-underline hover:no-underline"
            :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
          >
            RO
          </NuxtLink>
          <span class="text-hairline">|</span>
          <NuxtLink
            :to="switchLocalePath('en')"
            class="no-underline hover:no-underline"
            :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
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
      <a
        v-for="(link, i) in navLinks"
        :key="link.hash"
        :href="link.hash"
        class="py-4 text-ink"
        :class="{ 'border-b border-hairline': i !== navLinks.length - 1 }"
        @click="menuOpen = false"
      >
        {{ t(link.label) }}
      </a>
    </div>
  </header>
</template>
