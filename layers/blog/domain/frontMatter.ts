import { isCategoryCode } from './category'

export const POST_LOCALES = ['ro', 'en'] as const
export type PostLocale = (typeof POST_LOCALES)[number]

/** RO route slugs of the services a post may point to. */
export const POST_SERVICES = ['website', 'aplicatie-web', 'wordpress', 'shopify', 'automatizare-ai', 'granturi'] as const
export type PostService = (typeof POST_SERVICES)[number]

export function isPostService(value: unknown): value is PostService {
  return typeof value === 'string' && (POST_SERVICES as readonly string[]).includes(value)
}

export type FrontMatterValue = string | number | boolean

/** A post as read from disk: the folder it sits in, its filename (no `.md`) and the parsed front matter. */
export interface RawPost {
  folder: PostLocale
  file: string
  data: Readonly<Record<string, FrontMatterValue>>
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const REQUIRED_STRINGS = ['title', 'description', 'slug', 'lang', 'alt', 'category', 'keyword', 'date', 'updated', 'author', 'service', 'case']

function scalar(raw: string): FrontMatterValue {
  const value = raw.trim()
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replaceAll("''", "'")
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) return JSON.parse(value) as string
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return value
}

/** Parses the flat `key: value` front matter the blog uses (quoted or bare scalars, no nesting). */
export function parseFrontMatter(markdown: string): Record<string, FrontMatterValue> {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1]
  const data: Record<string, FrontMatterValue> = {}
  if (block === undefined) return data
  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (match?.[1] !== undefined && match[2] !== undefined) data[match[1]] = scalar(match[2])
  }
  return data
}

function str(post: RawPost, key: string): string | undefined {
  const value = post.data[key]
  return typeof value === 'string' ? value : undefined
}

/** Human-readable problems across all posts of both locales; empty when the content is valid. */
export function validatePostFrontMatter(posts: readonly RawPost[]): string[] {
  const issues: string[] = []
  const byKey = new Map(posts.map((post) => [`${post.folder}/${post.file}`, post]))

  for (const post of posts) {
    const where = `${post.folder}/${post.file}.md`
    const problem = (message: string) => issues.push(`${where}: ${message}`)

    for (const key of REQUIRED_STRINGS) {
      if (!str(post, key)) problem(`missing "${key}"`)
    }
    if (typeof post.data.readingTime !== 'number' || post.data.readingTime <= 0) problem('"readingTime" must be a positive number')

    const title = str(post, 'title')
    if (title && title.length > 60) problem(`title is ${title.length} chars (max 60)`)
    const description = str(post, 'description')
    if (description && (description.length < 120 || description.length > 160)) {
      problem(`description is ${description.length} chars (must be 120-160)`)
    }

    const slug = str(post, 'slug')
    if (slug && slug !== post.file) problem(`slug "${slug}" does not match the filename`)
    const lang = str(post, 'lang')
    if (lang && lang !== post.folder) problem(`lang "${lang}" does not match the folder`)
    const category = str(post, 'category')
    if (category && !isCategoryCode(category)) problem(`unknown category "${category}"`)
    const service = str(post, 'service')
    if (service && !isPostService(service)) problem(`unknown service "${service}"`)

    const date = str(post, 'date')
    const updated = str(post, 'updated')
    const dateOk = date !== undefined && DATE.test(date)
    const updatedOk = updated !== undefined && DATE.test(updated)
    if (date && !dateOk) problem(`date "${date}" is not YYYY-MM-DD`)
    if (updated && !updatedOk) problem(`updated "${updated}" is not YYYY-MM-DD`)
    if (dateOk && updatedOk && date > updated) problem(`date ${date} is after updated ${updated}`)

    const alt = str(post, 'alt')
    if (!alt) continue
    const otherFolder: PostLocale = post.folder === 'ro' ? 'en' : 'ro'
    const other = byKey.get(`${otherFolder}/${alt}`)
    if (!other) {
      problem(`alt "${alt}" has no post in ${otherFolder}/`)
      continue
    }
    if (str(other, 'alt') !== post.file) problem(`alt "${alt}" does not point back (its alt is "${str(other, 'alt') ?? ''}")`)
    // Report shared-field mismatches once per pair, from the RO side.
    if (post.folder === 'ro') {
      for (const key of ['category', 'service', 'case', 'draft']) {
        const mine = post.data[key] ?? (key === 'draft' ? false : undefined)
        const theirs = other.data[key] ?? (key === 'draft' ? false : undefined)
        if (mine !== theirs) problem(`${key} "${String(mine)}" differs from ${otherFolder}/${alt}.md ("${String(theirs)}")`)
      }
    }
  }
  return issues
}
