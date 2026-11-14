<script setup lang="ts">
import { projectEditorSectionTitle, type ProjectEditorSectionId } from '#layers/projects/domain/editorSections'

defineProps<{ section: ProjectEditorSectionId }>()
</script>

<template>
  <section class="rounded border border-hairline p-6" :aria-labelledby="section">
    <div class="flex items-center justify-between gap-4">
      <!-- The anchor the editor's side list links to. The margin leaves room for the sticky topbar
           and the section's own padding above the heading. -->
      <h2 :id="section" class="m-0 scroll-mt-26 text-base font-medium tracking-[-0.01em]">
        {{ projectEditorSectionTitle(section) }}
      </h2>
      <slot name="action" />
    </div>
    <slot />
  </section>
</template>
