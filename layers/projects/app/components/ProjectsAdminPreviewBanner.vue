<script setup lang="ts">
const props = defineProps<{
  slug: string
  /** Null while the project loads. */
  published: boolean | null
}>()

const heading = computed(() =>
  props.published ? 'Previzualizare draft — versiunea salvată' : 'Previzualizare draft — nepublicat',
)
const note = computed(() =>
  props.published
    ? 'Ce e salvat acum în admin. Pe site apare la câteva minute după salvare.'
    : 'Ce e salvat acum în admin. Vizitatorii nu văd pagina, iar motoarele de căutare nu o indexează.',
)
const link = 'tap-text eyebrow text-on-inverse underline underline-offset-4 hover:text-signal'
</script>

<template>
  <!-- Sticky above the page so a screenshot or a scrolled tab never passes for the live page. -->
  <aside aria-label="Previzualizare draft" class="sticky top-0 z-40 bg-inverse text-on-inverse">
    <div class="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
      <div class="flex min-w-0 flex-col gap-0.5">
        <p class="m-0 eyebrow">{{ heading }}</p>
        <p class="m-0 text-[13px] text-muted-ink">{{ note }}</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink v-if="published" :to="`/proiecte/${slug}`" :class="link">Vezi pe site</NuxtLink>
        <NuxtLink :to="`/admin/projects/${slug}`" :class="link">Editorul</NuxtLink>
      </div>
    </div>
  </aside>
</template>
