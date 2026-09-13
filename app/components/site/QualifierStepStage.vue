<script setup lang="ts">
import { STAGE_ORDER, type StageId } from '#layers/core/shared/types/service-stage'

const props = defineProps<{ modelValue: StageId | '' }>()
const emit = defineEmits<{ 'update:modelValue': [StageId]; next: [] }>()

const { t } = useI18n()

const cards = computed(() =>
  STAGE_ORDER.map((id, i) => ({
    id,
    number: String(i + 1).padStart(2, '0'),
    title: t(`qualifier.stage.options.${id}.title`),
    hint: t(`qualifier.stage.options.${id}.hint`),
    meta: `${t(`qualifier.stage.options.${id}.budget`)} · ${t(`qualifier.stage.options.${id}.timeline`)}`,
  })),
)
</script>

<template>
  <div>
    <fieldset>
      <legend class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
        {{ t('qualifier.stage.legend') }}
      </legend>
      <div class="mt-4 flex flex-col gap-2.5">
        <QualifierOptionCard
          v-for="card in cards"
          :key="card.id"
          name="qualifier-stage"
          :value="card.id"
          :selected="props.modelValue === card.id"
          :number="card.number"
          :title="card.title"
          :hint="card.hint"
          :meta="card.meta"
          @select="emit('update:modelValue', $event as StageId)"
        >
          <template #icon>
            <CoreStageIcon :stage="card.id" />
          </template>
        </QualifierOptionCard>
      </div>
    </fieldset>

    <div class="mt-6 flex justify-end">
      <AppButton variant="ink" :disabled="!props.modelValue" @click="emit('next')">
        {{ t('qualifier.next') }}
      </AppButton>
    </div>
  </div>
</template>
