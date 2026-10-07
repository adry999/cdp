<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label?: string
}>()

const iconName = computed(() => {
  const map: Record<string, string> = {
    'React': 'logos:react',
    'Vue 3': 'logos:vue',
    'Next.js': 'logos:nextjs-icon',
    'Nuxt': 'logos:nuxt-icon',
    'C# / .NET Core': 'logos:dotnet',
    'TypeScript': 'logos:typescript-icon',
    'Tailwind CSS': 'logos:tailwindcss-icon',
    'PostgreSQL': 'logos:postgresql',
    'Supabase': 'logos:supabase-icon',
    'Node.js': 'logos:nodejs-icon',
    'Edge Functions': 'lucide:zap',
    'Vercel': 'logos:vercel-icon',
    'Cloudflare': 'logos:cloudflare-icon',
    'Docker': 'logos:docker-icon',
    'GitHub Actions': 'logos:github-actions',
    'OpenAI API': 'logos:openai-icon',
    'Anthropic': 'simple-icons:anthropic',
    'pgvector': 'logos:postgresql',
    'Streaming': 'lucide:activity'
  }
  return props.label ? map[props.label] : undefined
})
</script>

<template>
  <span
    class="inline-flex items-center gap-[6px] rounded border border-hairline px-[9px] py-[5px] eyebrow text-muted transition-colors duration-300 hover:border-muted-ink hover:text-ink"
  >
    <Icon v-if="iconName" :name="iconName" class="h-3.5 w-3.5 shrink-0" />
    <slot>{{ label }}</slot>
  </span>
</template>
