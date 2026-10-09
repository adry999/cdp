<script setup lang="ts">
import { useNewsAdminList } from '#layers/news/state/useNewsAdminList'

definePageMeta({ layout: 'admin', i18n: false })

const { filter, filtered, pendingDelete, busy, actionError, confirmDelete } = await useNewsAdminList()
</script>

<template>
  <div>
    <AdminTopbar title="Noutăți">
      <template #actions>
        <AppButton variant="ink" href="/admin/news/nou">Adaugă</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="mb-4 flex gap-2">
        <ToggleChip
          v-for="opt in (['toate', 'draft', 'publicate'] as const)"
          :key="opt"
          size="admin"
          :pressed="filter === opt"
          @click="filter = opt"
        >
          {{ opt }}
        </ToggleChip>
      </div>

      <p v-if="actionError" role="alert" class="mb-4 eyebrow text-signal-text">{{ actionError.message }}</p>

      <div v-if="!filtered.length" class="rounded border border-hairline p-8 text-center text-muted">Nicio noutate.</div>
      <div v-else class="flex flex-col">
        <NewsAdminRow
          v-for="(item, i) in filtered"
          :key="item.id"
          :item="item"
          :last="i === filtered.length - 1"
          :confirming="pendingDelete === item.id"
          :busy="busy === item.id"
          @ask-delete="pendingDelete = item.id"
          @cancel-delete="pendingDelete = null"
          @confirm-delete="confirmDelete(item.id)"
        />
      </div>
    </div>
  </div>
</template>
