<script setup lang="ts">
import { QUALIFIER_BUDGET_KEYS, type QualifierBudgetKey } from '~~/shared/utils/qualifierRouting'

const props = defineProps<{ modelValue: QualifierBudgetKey | '' }>()
const emit = defineEmits<{
  'update:modelValue': [QualifierBudgetKey]
  next: []
  back: []
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <fieldset>
      <legend class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
        {{ t('qualifier.budget.legend') }}
      </legend>
      <div class="mt-4 flex flex-col gap-2.5">
        <QualifierOptionCard
          v-for="key in QUALIFIER_BUDGET_KEYS"
          :key="key"
          name="qualifier-budget"
          :value="key"
          :selected="props.modelValue === key"
          :title="t(`qualifier.budget.options.${key}`)"
          @select="emit('update:modelValue', $event as QualifierBudgetKey)"
        />
      </div>
    </fieldset>

    <div class="mt-6 flex items-center justify-between">
      <AppButton variant="outline" @click="emit('back')">{{ t('qualifier.back') }}</AppButton>
      <AppButton variant="ink" :disabled="!props.modelValue" @click="emit('next')">
        {{ t('qualifier.next') }}
      </AppButton>
    </div>
  </div>
</template>
