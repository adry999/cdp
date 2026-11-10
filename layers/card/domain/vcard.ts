export interface VCardInput {
  /** The name the phone shows in its contact list. */
  name: string
  organization: string
  title: string
  /** E.164. */
  phone: string
  email: string
  url: string
  socialProfiles: readonly string[]
}

/** RFC 6350 text escaping: backslash, comma, semicolon and line breaks. */
export function escapeVCardText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n')
}

/** "Adrian Iovu" -> "Iovu;Adrian;;;" (family;given;additional;prefix;suffix): the last word is the family name. */
function structuredName(name: string): string {
  const words = name.trim().split(/\s+/)
  const family = words.length > 1 ? words.pop() ?? '' : ''
  return `${escapeVCardText(family)};${escapeVCardText(words.join(' '))};;;`
}

/**
 * A vCard 3.0, the version both iOS and Android import without asking. CRLF line endings, as the
 * format requires; every line stays under the 75-octet folding limit for the values used here.
 */
export function buildVCard(input: VCardInput): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${structuredName(input.name)}`,
    `FN:${escapeVCardText(input.name)}`,
    `ORG:${escapeVCardText(input.organization)}`,
    `TITLE:${escapeVCardText(input.title)}`,
    `TEL;TYPE=WORK,VOICE:${input.phone}`,
    `EMAIL;TYPE=INTERNET,WORK:${input.email}`,
    `URL:${input.url}`,
    ...input.socialProfiles.map((profile) => `X-SOCIALPROFILE:${profile}`),
    'END:VCARD',
  ]
  return `${lines.join('\r\n')}\r\n`
}
