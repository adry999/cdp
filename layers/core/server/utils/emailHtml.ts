import { escapeXml } from '#layers/core/shared/utils/escapeXml'

export interface EmailField {
  label: string
  value: string
}

export interface EmailContent {
  lang: 'ro' | 'en'
  /** Inbox preview line, hidden in the body. */
  preheader: string
  heading: string
  paragraphs?: string[]
  fields?: EmailField[]
  /** Free text written by a visitor, shown as-is (line breaks kept). */
  quote?: { label: string; text: string }
  action?: { label: string; url: string }
  /** Absolute URL of public/brand/codepedia-wordmark-email.png (email clients drop SVG). */
  logoUrl: string
  footer: string
}

// Email clients ignore stylesheets and CSS variables, so the theme tokens from main.css are
// repeated here as literal values: paper, ink, signal, signal-text, muted, hairline, hatch.
const COLOR = {
  paper: '#FAF8F4',
  ink: '#0B0B0B',
  signal: '#FF4D14',
  signalText: '#C2370A',
  muted: '#6B6862',
  hairline: '#E2DED6',
  hatch: '#F1EEE7',
}
const SANS = "'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace"

/** Every value is escaped; line breaks in visitor text become <br>. */
function text(value: string): string {
  return escapeXml(value).replace(/\r?\n/g, '<br>')
}

function eyebrow(label: string): string {
  return `<div style="font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${COLOR.muted};">${text(label)}</div>`
}

function fieldRows(fields: EmailField[]): string {
  return fields
    .map(
      (field) =>
        `<tr><td style="padding:12px 0;border-top:1px solid ${COLOR.hairline};">${eyebrow(field.label)}` +
        `<div style="margin-top:4px;font-family:${SANS};font-size:15px;line-height:22px;color:${COLOR.ink};">${text(field.value)}</div></td></tr>`,
    )
    .join('')
}

/** Table layout with inline styles: the subset Gmail, Outlook and Apple Mail all render. */
export function renderEmailHtml(content: EmailContent): string {
  const paragraphs = (content.paragraphs ?? [])
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:24px;color:${COLOR.ink};">${text(paragraph)}</p>`,
    )
    .join('')
  const fields = content.fields?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;border-bottom:1px solid ${COLOR.hairline};">${fieldRows(content.fields)}</table>`
    : ''
  const quote = content.quote
    ? `<div style="margin:24px 0 0;">${eyebrow(content.quote.label)}` +
      `<div style="margin-top:8px;padding:16px;background:${COLOR.hatch};border-left:2px solid ${COLOR.signal};font-family:${SANS};font-size:15px;line-height:24px;color:${COLOR.ink};">${text(content.quote.text)}</div></div>`
    : ''
  const action = content.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;"><tr><td style="background:${COLOR.ink};border-radius:4px;">` +
      `<a href="${escapeXml(content.action.url)}" style="display:inline-block;padding:14px 22px;font-family:${SANS};font-size:15px;font-weight:500;line-height:20px;color:${COLOR.paper};text-decoration:none;">${text(content.action.label)}</a></td></tr></table>`
    : ''

  return `<!doctype html>
<html lang="${content.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${text(content.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.hatch};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${text(content.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.hatch};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.paper};border:1px solid ${COLOR.hairline};border-top:2px solid ${COLOR.signal};border-radius:4px;">
<tr><td style="padding:28px 32px 0;"><img src="${escapeXml(content.logoUrl)}" width="183" height="18" alt="CODEPEDIA" style="display:block;border:0;width:183px;height:18px;"></td></tr>
<tr><td style="padding:28px 32px 32px;">
<h1 style="margin:0 0 16px;font-family:${SANS};font-size:24px;line-height:30px;font-weight:500;letter-spacing:-0.02em;color:${COLOR.ink};">${text(content.heading)}</h1>
${paragraphs}${fields}${quote}${action}
</td></tr>
</table>
<p style="margin:20px 0 0;max-width:560px;font-family:${SANS};font-size:12px;line-height:18px;color:${COLOR.muted};">${text(content.footer)}</p>
</td></tr>
</table>
</body>
</html>`
}
