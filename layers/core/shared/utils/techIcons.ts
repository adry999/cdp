// Logos shown next to technology names in TechChip. Black-on-white brand marks (Next.js, Vercel, OpenAI)
// use the monochrome simple-icons version, drawn in currentColor, so they stay visible in the dark theme.
// Every icon here is bundled into the client (nuxt.config.ts `icon.clientBundle`), so no request leaves the site.
export const TECH_ICONS: Readonly<Record<string, string>> = {
  'React': 'logos:react',
  'Vue 3': 'logos:vue',
  'Next.js': 'simple-icons:nextdotjs',
  'Nuxt': 'logos:nuxt-icon',
  'C# / .NET Core': 'logos:dotnet',
  'TypeScript': 'logos:typescript-icon',
  'Tailwind CSS': 'logos:tailwindcss-icon',
  'PostgreSQL': 'logos:postgresql',
  'Supabase': 'logos:supabase-icon',
  'Node.js': 'logos:nodejs-icon',
  'Edge Functions': 'lucide:zap',
  'Vercel': 'simple-icons:vercel',
  'Cloudflare': 'logos:cloudflare-icon',
  'Docker': 'logos:docker-icon',
  'GitHub Actions': 'logos:github-actions',
  'OpenAI API': 'simple-icons:openai',
  'Anthropic': 'simple-icons:anthropic',
  'pgvector': 'logos:postgresql',
  'Streaming': 'lucide:activity',
}

export function techIcon(label: string | undefined): string | undefined {
  return label ? TECH_ICONS[label] : undefined
}
