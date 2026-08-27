<script setup lang="ts">
import { STAGE_IDS, type StageId } from '~~/shared/utils/qualifierRouting'

const props = defineProps<{ modelValue: StageId | '' }>()
const emit = defineEmits<{ 'update:modelValue': [StageId]; next: [] }>()

const { t } = useI18n()
</script>

<template>
  <div>
    <fieldset>
      <legend class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
        {{ t('qualifier.stage.legend') }}
      </legend>
      <div class="mt-4 flex flex-col gap-2.5">
        <QualifierOptionCard
          v-for="id in STAGE_IDS"
          :key="id"
          name="qualifier-stage"
          :value="id"
          :selected="props.modelValue === id"
          :title="t(`qualifier.stage.options.${id}.title`)"
          :hint="t(`qualifier.stage.options.${id}.hint`)"
          @select="emit('update:modelValue', $event as StageId)"
        />
      </div>
    </fieldset>

    <div class="mt-6 flex justify-end">
      <AppButton variant="ink" :disabled="!props.modelValue" @click="emit('next')">
        {{ t('qualifier.next') }}
      </AppButton>
    </div>
  </div>
</template>
