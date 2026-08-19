<template>
  <div class="flex min-h-screen flex-col">
    <CaseStudyHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter compact />
  </div>
</template>
