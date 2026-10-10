<script setup lang="ts">
import type { PublishChecklist } from '#layers/projects/domain/adminProjectList'

defineProps<{ title: string; checklist: PublishChecklist; busy: boolean }>()
const consent = defineModel<boolean>('consent', { required: true })
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <AdminDialog open :title="`Publică: ${title}`" @close="$emit('cancel')">
    <ul class="m-0 flex list-none flex-col gap-3 p-0">
      <li v-for="item in checklist.items" :key="item.id" class="flex gap-3">
        <input
          v-if="item.id === 'consent'"
          :id="`check-${item.id}`"
          v-model="consent"
          type="checkbox"
          class="mt-1 accent-signal"
        >
        <span
          v-else
          aria-hidden="true"
          class="mt-0.5 flex size-4 flex-none items-center justify-center rounded-sm border font-mono text-[10px] leading-none"
          :class="item.done ? 'border-ink bg-ink text-paper' : 'border-hairline text-muted'"
        >
          {{ item.done ? '✓' : '' }}
        </span>
        <div class="min-w-0">
          <component :is="item.id === 'consent' ? 'label' : 'span'" :for="item.id === 'consent' ? 'check-consent' : undefined" class="text-[15px]">
            {{ item.label }}
            <span class="eyebrow-sm" :class="item.done ? 'text-muted' : item.required ? 'text-signal-text' : 'text-muted'">
              {{ item.done ? 'gata' : item.required ? 'obligatoriu' : 'opțional' }}
            </span>
          </component>
          <p class="m-0 mt-0.5 text-sm text-muted">{{ item.hint }}</p>
        </div>
      </li>
    </ul>
    <p v-if="checklist.demoScreens" role="note" class="m-0 mt-4 rounded border border-signal-text p-3 text-sm text-signal-text">
      Atenție: doar capturi pe date demo. Nu prezenta ecranele ca pe date reale ale clientului.
    </p>
    <template #actions>
      <AppButton variant="outline" @click="$emit('cancel')">Anulează</AppButton>
      <AppButton variant="signal" :disabled="!checklist.canPublish || busy" @click="$emit('confirm')">
        {{ busy ? 'Se publică…' : 'Publică' }}
      </AppButton>
    </template>
  </AdminDialog>
</template>
