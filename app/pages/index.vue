<script setup lang="ts">
const { t, locale } = useI18n()
const config = useRuntimeConfig()

// Shares the 'home' cache key with HomeContact/HomeWork/etc. — every child
// section below fetches the same key, so this doesn't add a request.
const { data: home } = await useHomeData()
const settings = computed(() => home.value?.settings)

// CMS meta_title/meta_description/og_image were being saved from Setări and
// silently ignored, same as the footer fields — an admin editing them had no
// way to know the change did nothing. Falls back to the existing i18n copy
// when a field hasn't been filled in, so nothing changes visibly until it is.
const metaTitle = computed(
  () => pick(settings.value?.meta_title_ro ?? '', settings.value?.meta_title_en, locale.value) || t('seo.home.title'),
)
const metaDescription = computed(
  () =>
    pick(settings.value?.meta_description_ro ?? '', settings.value?.meta_description_en, locale.value) ||
    t('seo.home.description'),
)
const ogImage = computed(() => settings.value?.og_image_path || `${config.public.siteUrl}/og-image.png`)

// Getters, not resolved strings: / and /en share this component, and Vue
// Router reuses the instance across routes that render the same component,
// so setup() doesn't re-run on a client-side locale switch. Resolved strings
// captured the RO text once and never updated; getters stay reactive to `t`.
useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  ogTitle: () => metaTitle.value,
  ogDescription: () => metaDescription.value,
  ogImage: () => ogImage.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeServices />
    <HomeStack />
    <HomeProcess />
    <HomeWork />
    <HomeAbout />
    <HomeFaq />
    <HomeContact />
  </div>
</template>
