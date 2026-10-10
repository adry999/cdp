<script setup lang="ts">
const { locale } = useI18n()
const { setLocaleOverride } = useLocaleOverride()
</script>

<template>
  <span class="flex items-center gap-1.5">
    <!-- SwitchLocalePathLink, not NuxtLink + switchLocalePath(): the header
         renders before the page sets its localized slug, and only this
         component's href is rewritten after the page renders on the server. -->
    <SwitchLocalePathLink
      locale="ro"
      hreflang="ro"
      lang="ro"
      class="flex min-h-11 items-center no-underline hover:no-underline nav:min-h-0"
      :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
      :aria-current="locale === 'ro' ? 'true' : undefined"
      @click="setLocaleOverride('ro')"
    >
      RO
    </SwitchLocalePathLink>
    <span aria-hidden="true" class="text-rule">/</span>
    <SwitchLocalePathLink
      locale="en"
      hreflang="en"
      lang="en"
      class="flex min-h-11 items-center no-underline hover:no-underline nav:min-h-0"
      :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
      :aria-current="locale === 'en' ? 'true' : undefined"
      @click="setLocaleOverride('en')"
    >
      EN
    </SwitchLocalePathLink>
  </span>
</template>
