/** AI search / answer engine bots: allowed on public routes so the studio can be cited in answers. */
const AI_SEARCH_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-SearchBot',
  'Claude-User',
]

/** AI model training crawlers: allowed on public routes so the brand is part of model training data. */
const AI_TRAINING_AGENTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']

const DISALLOW_RULES = `Disallow: /admin
Disallow: /api/`

function renderAgentGroup(agents: readonly string[]): string {
  return `${agents.map((agent) => `User-agent: ${agent}`).join('\n')}\n${DISALLOW_RULES}`
}

/** A preview build (NUXT_PUBLIC_NOINDEX) still lets crawlers in, so they can read the
 * X-Robots-Tag noindex header; it only stops advertising the sitemap. */
export function robotsTxt(baseUrl: string, noindex: boolean): string {
  const parts = [
    `User-agent: *\n${DISALLOW_RULES}`,
    renderAgentGroup(AI_SEARCH_AGENTS),
    renderAgentGroup(AI_TRAINING_AGENTS),
  ]

  const sitemapLine = noindex ? '' : `\nSitemap: ${baseUrl}/sitemap.xml\n`
  return `${parts.join('\n\n')}\n${sitemapLine}`
}

