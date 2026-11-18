import { inlineText, type InlineNode } from './body'

/** A header this short (`#`, `Nr`, `Tip`) labels a column of short values. */
const SHORT_HEADER_MAX_LENGTH = 3

/**
 * Which columns of a post table size to their content instead of taking the minimum cell width:
 * the first (the row label, already sized by its longest word) and any column with a short header,
 * such as a `#` column of single digits. On a phone the minimum on those only pushes the last
 * column off-screen.
 */
export function compactTableColumns(head: readonly InlineNode[][]): boolean[] {
  return head.map((cell, index) => index === 0 || inlineText(cell).trim().length <= SHORT_HEADER_MAX_LENGTH)
}
