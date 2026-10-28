<script setup lang="ts">
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { Database } from '#layers/core/shared/types/database.types'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createHomeSettingsAdminRepository } from '#layers/home/data/homeSettingsAdminRepository'
import { resolveHeroVariant, type HeroChoice } from '#layers/home/domain/heroVariant'

definePageMeta({ layout: 'admin', i18n: false })

const config = useRuntimeConfig()
const envValue = (config.public.heroBgVariant as string | undefined) || 'dot-matrix'
const envEffective = resolveHeroVariant(envValue) ?? 'none'

const repository = createHomeSettingsAdminRepository(useSupabaseClient<Database>())
const revalidatePublicCache = useRevalidatePublicCache()

type Option = { id: HeroChoice | null; label: string; description: string }

const options: Option[] = [
  { id: 'dot-matrix', label: 'dot-matrix', description: 'Grilă de puncte care se curbează în jurul cursorului, cu strălucire portocalie.' },
  { id: 'constellation', label: 'constellation', description: 'Particule în derivă care se unesc prin linii portocalii lângă cursor.' },
  { id: 'light-orbs', label: 'light-orbs', description: 'Sfere luminoase moi care urmăresc cursorul.' },
  { id: 'none', label: 'none', description: 'Fără fundal interactiv.' },
  {
    id: null,
    label: `Implicit (din variabila de mediu: ${envValue})`,
    description: 'Folosește valoarea din NUXT_PUBLIC_HERO_BG_VARIANT.',
  },
]

const stored = ref<HeroChoice | null>(null)
const selected = ref<HeroChoice | null>(null)
const loadStatus = ref<AsyncStatus>('pending')
const saveStatus = ref<AsyncStatus>('idle')
const error = ref<AppError | null>(null)

// The guard snapshots a plain object; `selected` is its only field.
const { markSaved } = useUnsavedChangesGuard(reactive({ selected }))

onMounted(async () => {
  try {
    stored.value = await repository.getHeroVariant()
    selected.value = stored.value
    markSaved()
    loadStatus.value = 'success'
  } catch (caught) {
    error.value = toAppError(caught)
    loadStatus.value = 'error'
  }
})

const dirty = computed(() => selected.value !== stored.value)

async function save() {
  saveStatus.value = 'pending'
  error.value = null
  try {
    await repository.setHeroVariant(selected.value)
    stored.value = selected.value
    markSaved()
    saveStatus.value = 'success'
    await revalidatePublicCache()
  } catch (caught) {
    error.value = toAppError(caught)
    saveStatus.value = 'error'
  }
}
</script>

<template>
  <div>
    <AdminTopbar title="Hero">
      <template #actions>
        <AppButton variant="ink" :disabled="!dirty || saveStatus === 'pending' || loadStatus !== 'success'" @click="save">
          {{ saveStatus === 'pending' ? 'Se salvează…' : 'Salvează' }}
        </AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <p class="mb-2 max-w-[640px] text-[15px] text-muted">
        Alege fundalul din hero-ul paginii principale. Modificarea ajunge la vizitatori în câteva minute (cache);
        previzualizările de mai jos o arată imediat. „Implicit” folosește variabila de mediu
        <code>NUXT_PUBLIC_HERO_BG_VARIANT</code> (acum: {{ envEffective }}).
      </p>
      <p v-if="saveStatus === 'success' && !dirty" role="status" class="mb-4 eyebrow text-signal-text">Salvat.</p>
      <p v-if="error" role="alert" class="mb-4 eyebrow text-signal-text">{{ error.message }}</p>

      <div v-if="loadStatus === 'pending'" class="text-muted">Se încarcă…</div>
      <fieldset v-else class="m-0 flex flex-col border-0 p-0">
        <legend class="sr-only">Fundal hero</legend>
        <label
          v-for="(opt, i) in options"
          :key="opt.id ?? 'implicit'"
          class="flex cursor-pointer flex-wrap items-center gap-4 border-t border-hairline py-3"
          :class="{ 'border-b': i === options.length - 1 }"
        >
          <input v-model="selected" type="radio" name="hero-variant" :value="opt.id" class="accent-signal">
          <div class="min-w-0 flex-[2_1_260px]">
            <div class="text-[15px] text-ink">{{ opt.label }}</div>
            <div class="text-[15px] text-muted">{{ opt.description }}</div>
          </div>
          <div class="flex-[0_0_90px] eyebrow text-signal-text">
            <template v-if="opt.id === stored">Activ</template>
          </div>
          <div v-if="opt.id" class="flex flex-[0_0_140px] justify-end gap-4">
            <TextLink :to="`/?hero=${opt.id}`" target="_blank" rel="noopener">RO</TextLink>
            <TextLink :to="`/en?hero=${opt.id}`" target="_blank" rel="noopener">EN</TextLink>
          </div>
          <div v-else class="flex flex-[0_0_140px] justify-end gap-4">
            <TextLink :to="`/?hero=${envEffective}`" target="_blank" rel="noopener">RO</TextLink>
            <TextLink :to="`/en?hero=${envEffective}`" target="_blank" rel="noopener">EN</TextLink>
          </div>
        </label>
      </fieldset>
    </div>
  </div>
</template>
