import { describe, expect, it } from 'vitest'
import { buildTeamEmail, type TeamNotification } from './leadNotification'
import { buildVisitorEmail } from './visitorConfirmation'

const notification: TeamNotification = {
  subject: 'Solicitare nouă — Ana Pop',
  fields: [
    { label: 'Nume', value: 'Ana Pop' },
    { label: 'Email', value: 'ana@example.com' },
  ],
  message: { label: 'Mesaj', text: 'Vrem un portal.\nCât costă?' },
  replyTo: 'ana@example.com',
}

describe('buildTeamEmail', () => {
  const email = buildTeamEmail(notification, 'https://codepedia.md')

  it('replies to the visitor and goes to the team inbox', () => {
    expect(email.replyTo).toBe('ana@example.com')
    expect(email.to).toBeUndefined()
    expect(email.subject).toBe('Solicitare nouă — Ana Pop')
  })

  it('keeps a plain-text version with every field, the message and the admin link', () => {
    expect(email.text).toBe(
      [
        'Nume: Ana Pop',
        'Email: ana@example.com',
        '',
        'Mesaj:',
        'Vrem un portal.\nCât costă?',
        '',
        'Solicitările din admin: https://codepedia.md/admin/leads',
      ].join('\n'),
    )
  })

  it('links the admin and the logo on the given domain', () => {
    expect(email.html).toContain('href="https://codepedia.md/admin/leads"')
    expect(email.html).toContain('https://codepedia.md/brand/codepedia-wordmark-email.png')
    expect(email.html).toContain('Vrem un portal.<br>Cât costă?')
  })
})

describe('buildVisitorEmail', () => {
  const settings = {
    responseTime: { ro: '1 zi lucrătoare', en: '1 working day' },
    contactEmail: 'contact@codepedia.md',
  }

  it('answers in Romanian from the RO domain, with the response time from the site settings', () => {
    const email = buildVisitorEmail(
      { to: 'ana@example.com', name: 'Ana', lang: 'ro' },
      { ...settings, siteUrl: 'https://codepedia.md' },
    )
    expect(email.to).toBe('ana@example.com')
    expect(email.replyTo).toBe('contact@codepedia.md')
    expect(email.subject).toBe('Am primit solicitarea ta')
    expect(email.text).toContain('Mulțumim, Ana.')
    expect(email.text).toContain('în 1 zi lucrătoare.')
    expect(email.html).toContain('href="https://codepedia.md/proiecte"')
    expect(email.html).toContain('<html lang="ro">')
  })

  it('answers in English from the EN domain', () => {
    const email = buildVisitorEmail(
      { to: 'ana@example.com', name: 'Ana', lang: 'en' },
      { ...settings, siteUrl: 'https://codepedia.studio' },
    )
    expect(email.subject).toBe('We received your request')
    expect(email.text).toContain('within 1 working day.')
    expect(email.html).toContain('href="https://codepedia.studio/en/work"')
    expect(email.text).toContain('codepedia.studio')
  })

  it('shortens and escapes the name the visitor typed', () => {
    const email = buildVisitorEmail(
      { to: 'x@example.com', name: `<b>${'x'.repeat(100)}`, lang: 'ro' },
      { ...settings, siteUrl: 'https://codepedia.md' },
    )
    expect(email.html).not.toContain('<b>')
    expect(email.text).not.toContain('x'.repeat(61))
  })
})
