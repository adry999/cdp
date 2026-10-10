<script setup lang="ts">
import { resolveHeroVariant } from '#layers/home/domain/heroVariant'

definePageMeta({ layout: 'admin', i18n: false })

const config = useRuntimeConfig()
const active = resolveHeroVariant(config.public.heroBgVariant as string | undefined) ?? 'none'

const options = [
  { id: 'dot-matrix', description: 'Grilă de puncte care se curbează în jurul cursorului, cu strălucire portocalie.' },
  { id: 'constellation', description: 'Particule în derivă care se unesc prin linii portocalii lângă cursor.' },
  { id: 'light-orbs', description: 'Sfere luminoase moi care urmăresc cursorul.' },
  { id: 'none', description: 'Fără fundal interactiv.' },
] as const
</script>

<template>
  <div>
    <AdminTopbar title="Hero" />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <p class="mb-6 max-w-[640px] text-[15px] text-muted">
        Fundalul din hero-ul paginii principale se alege prin variabila de mediu
        <code>NUXT_PUBLIC_HERO_BG_VARIANT</code>. Folosește previzualizările de mai jos pentru a compara variantele,
        apoi setează variabila în Vercel și redeploy-ază.
      </p>

      <div class="flex flex-col">
        <div
          v-for="(opt, i) in options"
          :key="opt.id"
          class="flex flex-wrap items-center gap-4 border-t border-hairline py-3"
          :class="{ 'border-b': i === options.length - 1 }"
        >
          <div class="min-w-0 flex-[2_1_260px]">
            <div class="text-[15px] text-ink">{{ opt.id }}</div>
            <div class="text-[15px] text-muted">{{ opt.description }}</div>
          </div>
          <div class="flex-[0_0_90px] eyebrow text-signal-text">
            <template v-if="opt.id === active">Activ</template>
          </div>
          <div class="flex flex-[0_0_140px] justify-end gap-4">
            <TextLink :to="`/?hero=${opt.id}`" target="_blank" rel="noopener">RO</TextLink>
            <TextLink :to="`/en?hero=${opt.id}`" target="_blank" rel="noopener">EN</TextLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
