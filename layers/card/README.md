# layers/card

The business-card page: what the QR code printed on a card, folder or badge opens. One page per
person, `/c/<slug>` (`/en/c/<slug>`); `/c` without a slug opens the default person
(`DEFAULT_CARD_SLUG`, Adrian). The card prints only the URL, so phone numbers and links change in
`layers/content/data/team.ts` with a deploy, never with a reprint. Depends on `layers/core`,
`layers/content`, `layers/projects` and `layers/qualifier`.

## Routes

- `/c/[[slug]]` — `app/pages/c/[[slug]].vue`, layout `bare` (no site header or footer). The person
  (name from `TEAM`), "Salvează contactul" (the vCard), WhatsApp and Telegram (hidden when the
  member's `card.whatsapp` / `card.telegram` is empty), the budget calculator (`QualifierCta`; with
  the qualifier off, a link to `/contact`), two projects (`selectHomeProjects`) and the site and
  social links. An unknown slug is a 404. `noindex`, not in the sitemap.
- `GET /vcard/<slug>.vcf[?lang=en]` — `server/routes/vcard/[file].ts`: the member's vCard 3.0
  (`domain/vcard.ts`), `Content-Disposition: attachment; filename="<name>.vcf"`. Not under `/c/`,
  where it would shadow the page route `/c/<slug>`.

## Source of a request (`?s=`)

The card and the badge print one QR code, `codepedia.md/c` (`/c/<slug>` for another person), so a
request sent from it shows `/c` as its page. An optional `?s=<word>` (e.g. `?s=mapa` on a future
print) tells the materials apart; `cardSource()` keeps only a short lowercase word.

- Budget calculator: the qualifier sends the page it was opened on (`/c`, or `/c?s=mapa`), stored in
  `leads.page` and shown in the admin lead detail and the team email.
- Qualifier off: the button links to `/contact?utm_source=qr&utm_campaign=<slug>` (plus `utm_medium=<s>`
  when the QR has one),
  and the contact form stores those `utm_*` with the lead.

## Adding a person

Add `card` to their entry in `layers/content/data/team.ts` (`slug`, `phone`, `email`, `whatsapp`,
`telegram`); `data/content.test.ts` checks the values. Their QR then encodes
`https://codepedia.md/c/<slug>`. A printed slug is permanent: never rename or remove it.

## Public API

None: no other module uses this one. `domain/icons.ts` exports `CARD_ICONS`, which the root
`nuxt.config.ts` adds to the icon client bundle.
