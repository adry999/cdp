// Logos shown next to technology names in TechChip. All of them are single-colour marks drawn in
// currentColor (simple-icons for brands, lucide for generic concepts), so a chip reads as one set:
// muted at rest, ink on hover, and visible in the dark theme without per-brand colours.
// Every icon here is bundled into the client (nuxt.config.ts `icon.clientBundle`), so no request leaves the site.
export const TECH_ICONS: Readonly<Record<string, string>> = {
  'React': 'simple-icons:react',
  'Vue 3': 'simple-icons:vuedotjs',
  'Next.js': 'simple-icons:nextdotjs',
  'Nuxt': 'simple-icons:nuxt',
  'C# / .NET Core': 'simple-icons:dotnet',
  'TypeScript': 'simple-icons:typescript',
  'Tailwind CSS': 'simple-icons:tailwindcss',
  'PostgreSQL': 'simple-icons:postgresql',
  'Supabase': 'simple-icons:supabase',
  'Node.js': 'simple-icons:nodedotjs',
  'Edge Functions': 'lucide:zap',
  'Vercel': 'simple-icons:vercel',
  'Cloudflare': 'simple-icons:cloudflare',
  'Docker': 'simple-icons:docker',
  'GitHub Actions': 'simple-icons:githubactions',
  'OpenAI API': 'simple-icons:openai',
  'Anthropic': 'simple-icons:anthropic',
  'pgvector': 'lucide:database',
  'Streaming': 'lucide:activity',
}

export function techIcon(label: string | undefined): string | undefined {
  return label ? TECH_ICONS[label] : undefined
}
