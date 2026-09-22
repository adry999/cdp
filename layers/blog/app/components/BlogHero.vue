<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <PageHero number="00" :label="t('nav.blog')" :title="t('blog.hero.title')" :intro="t('blog.hero.intro')" />
</template>
