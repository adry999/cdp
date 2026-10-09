/** A node of `@nuxt/content`'s minimark tree: plain text, or `[tag, props, ...children]`. */
export type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'break' }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'em'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] }

export interface FaqItem {
  question: string
  answer: InlineNode[][]
}

export type PostBlock =
  | { type: 'callout'; children: InlineNode[] }
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; children: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }
  | { type: 'table'; head: InlineNode[][]; rows: InlineNode[][][] }
  | { type: 'faq'; items: FaqItem[] }
  | { type: 'cta'; text: string; label: string; href: string }

export interface TocItem {
  id: string
  text: string
}

export interface PostBody {
  blocks: PostBlock[]
  toc: TocItem[]
}

/** Anchor id for a heading: lower-case ASCII words joined by dashes. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const FAQ_HEADING = /^(întrebări frecvente|frequently asked questions)/i

const BLOCK_TAGS = new Set(['p', 'ul', 'ol', 'li', 'blockquote', 'table', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

function tagOf(node: MinimarkNode): string | null {
  return typeof node === 'string' ? null : node[0]
}

function childrenOf(node: MinimarkNode): MinimarkNode[] {
  return typeof node === 'string' ? [] : (node.slice(2) as MinimarkNode[])
}

function propOf(node: MinimarkNode, key: string): string | undefined {
  if (typeof node === 'string') return undefined
  const value = node[1][key]
  return typeof value === 'string' ? value : undefined
}

function plainText(nodes: MinimarkNode[]): string {
  return nodes.map((node) => (typeof node === 'string' ? node : plainText(childrenOf(node)))).join('')
}

function inline(nodes: MinimarkNode[]): InlineNode[] {
  const out: InlineNode[] = []
  for (const node of nodes) {
    if (typeof node === 'string') {
      out.push({ type: 'text', text: node })
      continue
    }
    const tag = node[0]
    if (tag === 'strong') out.push({ type: 'strong', children: inline(childrenOf(node)) })
    else if (tag === 'em') out.push({ type: 'em', children: inline(childrenOf(node)) })
    else if (tag === 'code') out.push({ type: 'code', text: plainText(childrenOf(node)) })
    else if (tag === 'br') out.push({ type: 'break' })
    else if (tag === 'a') {
      out.push({ type: 'link', href: propOf(node, 'href') ?? '#', children: inline(childrenOf(node)) })
    } else if (tag !== 'comment') out.push(...inline(childrenOf(node)))
  }
  return out
}

/** Inline content of a container whose children may be wrapped in `<p>` (loose list items, quotes). */
function flowInline(nodes: MinimarkNode[]): InlineNode[] {
  const out: InlineNode[] = []
  for (const node of nodes) {
    const tag = tagOf(node)
    if (tag === 'p') {
      if (out.length) out.push({ type: 'text', text: ' ' })
      out.push(...inline(childrenOf(node)))
    } else if (tag !== null && BLOCK_TAGS.has(tag)) {
      out.push(...flowInline(childrenOf(node)))
    } else {
      out.push(...inline([node]))
    }
  }
  return out
}

function tableRows(table: MinimarkNode): MinimarkNode[] {
  return childrenOf(table).flatMap((section) => (tagOf(section) === 'tr' ? [section] : childrenOf(section)))
}

function buildTable(table: MinimarkNode): PostBlock {
  const [headRow, ...bodyRows] = tableRows(table)
  const cells = (row: MinimarkNode | undefined) => (row ? childrenOf(row).map((cell) => flowInline(childrenOf(cell))) : [])
  return { type: 'table', head: cells(headRow), rows: bodyRows.map(cells) }
}

function findLink(nodes: MinimarkNode[]): MinimarkNode | null {
  for (const node of nodes) {
    if (tagOf(node) === 'a') return node
    const nested = findLink(childrenOf(node))
    if (nested) return nested
  }
  return null
}

function buildCta(paragraph: MinimarkNode): PostBlock {
  const link = findLink(childrenOf(paragraph))
  return {
    type: 'cta',
    text: plainText(childrenOf(paragraph)),
    label: link ? plainText(childrenOf(link)) : '',
    href: (link && propOf(link, 'href')) || '#',
  }
}

/**
 * Turns a post's minimark tree into the typed blocks the blog page renders (SEO_SPEC §5):
 * blockquotes become the "Pe scurt" callout, `##` get anchor ids and feed the table of
 * contents, `###` + answer inside the FAQ section become accordion items, and the
 * paragraph after a `---` becomes the closing call to action.
 */
export function buildPostBody(nodes: MinimarkNode[]): PostBody {
  const blocks: PostBlock[] = []
  const toc: TocItem[] = []
  const usedIds = new Set<string>()
  let faq: FaqItem[] | null = null
  let faqItem: FaqItem | null = null
  let afterRule = false

  for (const node of nodes) {
    const tag = tagOf(node)
    if (tag === null || tag === 'comment') continue

    if (tag === 'h2') {
      const text = plainText(childrenOf(node)).trim()
      const base = slugifyHeading(text) || 'section'
      let id = base
      for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`
      usedIds.add(id)
      blocks.push({ type: 'h2', id, text })
      toc.push({ id, text })
      faqItem = null
      afterRule = false
      faq = null
      if (FAQ_HEADING.test(text)) {
        faq = []
        blocks.push({ type: 'faq', items: faq })
      }
      continue
    }

    if (tag === 'h3') {
      const text = plainText(childrenOf(node)).trim()
      afterRule = false
      if (faq) {
        faqItem = { question: text, answer: [] }
        faq.push(faqItem)
      } else {
        blocks.push({ type: 'h3', text })
      }
      continue
    }

    if (tag === 'hr') {
      faq = null
      faqItem = null
      afterRule = true
      continue
    }

    if (faqItem) {
      const content = flowInline([node])
      if (content.length) faqItem.answer.push(content)
      continue
    }

    if (afterRule && tag === 'p') {
      blocks.push(buildCta(node))
      afterRule = false
      continue
    }
    afterRule = false

    if (tag === 'blockquote') {
      blocks.push({ type: 'callout', children: flowInline(childrenOf(node)) })
    } else if (tag === 'table') {
      blocks.push(buildTable(node))
    } else if (tag === 'ul' || tag === 'ol') {
      const items = childrenOf(node)
        .filter((child) => tagOf(child) === 'li')
        .map((li) => flowInline(childrenOf(li)))
      blocks.push({ type: 'list', ordered: tag === 'ol', items })
    } else {
      const children = tag === 'p' ? inline(childrenOf(node)) : flowInline([node])
      if (children.length) blocks.push({ type: 'p', children })
    }
  }

  return { blocks: blocks.filter((block) => block.type !== 'faq' || block.items.length > 0), toc }
}
