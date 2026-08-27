<script setup lang="ts">
const head = useLocaleHead()
useHead(head)

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))

// Organization JSON-LD is public-SEO-only — `immediate: false` on /admin skips
// the fetch there. Shares the 'home' cache key (and now the handler) with
// HomeContact/HomeWork/etc. via useHomeData(), so on public pages this doesn't
// add a second round trip on top of theirs.
const { data: home, execute: fetchHome } = await useHomeData({ immediate: !isAdmin.value })

// immediate:false only skips the *initial* call — landing directly on
// /admin (bookmark, hard refresh) then navigating client-side to a public
// route doesn't retrigger it on its own, so `home` would stay null and the
// JSON-LD below would silently keep using its hardcoded fallback email for
// the rest of that session.
watch(isAdmin, (nowAdmin) => {
  if (!nowAdmin && home.value === null) fetchHome()
})

useHead(() => ({
  script: isAdmin.value
    ? []
    : [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Codepedia',
            url: 'https://codepedia.md',
            logo: 'https://codepedia.md/brand/codepedia-mark.svg',
            email: home.value?.settings?.contact_email ?? 'contact@codepedia.md',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Chișinău',
              addressCountry: 'MD',
            },
          }),
        },
      ],
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
