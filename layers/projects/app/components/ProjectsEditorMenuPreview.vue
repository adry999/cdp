<script setup lang="ts">
import { SERVICE_TAG_LABELS_RO } from '#layers/core/shared/types/service-tag'
import { NAV_PROJECTS_PER_SERVICE } from '#layers/projects/domain/navProjects'
import type { MenuPreviewGroup } from '#layers/projects/domain/menuPreview'

defineProps<{ groups: MenuPreviewGroup[]; published: boolean }>()
</script>

<template>
  <section class="rounded border border-hairline p-6">
    <div class="flex items-center justify-between gap-4">
      <h2 class="m-0 text-base font-medium">Previzualizare meniu</h2>
      <div class="eyebrow text-muted">Max. {{ NAV_PROJECTS_PER_SERVICE }} / serviciu</div>
    </div>
    <p v-if="!published" class="m-0 mt-3 text-[13px] text-signal-text">
      Proiectul e ciornă: apare în meniu doar după publicare.
    </p>
    <div class="mt-4">
      <div v-for="group in groups" :key="group.service" class="border-t border-hairline py-3">
        <div class="flex justify-between gap-3 eyebrow text-muted">
          <span>{{ SERVICE_TAG_LABELS_RO[group.service] }}</span>
          <span>{{ group.items.length }} / {{ NAV_PROJECTS_PER_SERVICE }}</span>
        </div>
        <ul v-if="group.items.length" class="m-0 mt-2 flex list-none flex-col gap-2 p-0">
          <li v-for="item in group.items" :key="item.slug" class="flex items-center gap-3">
            <img
              v-if="item.coverPath"
              :src="item.coverPath"
              alt=""
              class="h-5 w-8 flex-none rounded-[3px] border border-hairline object-cover"
            >
            <div v-else class="h-5 w-8 flex-none rounded-[3px] border border-hairline media-placeholder [--placeholder-mark:12px]" />
            <span class="min-w-0 flex-1 truncate text-sm" :class="item.isCurrent ? 'text-ink' : 'text-muted'">
              {{ item.title }}
            </span>
            <span class="flex-none font-mono text-[11px] uppercase text-signal-text">
              {{ item.isCurrent ? 'acesta' : item.featured ? '●' : '' }}
            </span>
          </li>
        </ul>
        <p v-else class="m-0 mt-2 text-[13px] text-muted">Niciun proiect: serviciul apare fără proiecte.</p>
      </div>
    </div>
  </section>
</template>
