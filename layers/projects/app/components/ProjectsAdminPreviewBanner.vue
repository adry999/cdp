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
// Hit area 44px on phones, 32px from the nav breakpoint (tap-text pads it without growing the bar).
const link = 'tap-text min-h-11 nav:min-h-8 eyebrow text-paper underline underline-offset-4 hover:decoration-2'
</script>

<template>
  <!-- Sticky above the page so a screenshot or a scrolled tab never passes for the live page. Ink on
       paper flipped: the bar is the opposite of the page in both themes. -->
  <aside aria-label="Previzualizare draft" class="sticky top-0 z-40 bg-ink text-paper">
    <div class="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
      <div class="flex min-w-0 flex-col gap-0.5">
        <p class="m-0 eyebrow">{{ heading }}</p>
        <!-- The heading says it all on a phone, where the sticky bar must stay short. -->
        <p class="m-0 hidden text-[13px] text-paper/75 sm:block">{{ note }}</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink v-if="published" :to="`/proiecte/${slug}`" :class="link">Vezi pe site</NuxtLink>
        <NuxtLink :to="`/admin/projects/${slug}`" :class="link">Editorul</NuxtLink>
      </div>
    </div>
  </aside>
</template>
