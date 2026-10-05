# Storybook pentru Codepedia

Copiază conținutul acestui folder în rădăcina repo-ului adry999/cdp, păstrând căile.

## Instalare

```bash
npx nuxi@latest module add storybook
npm i -D storybook@^10 @storybook/addon-docs@^10 @storybook/addon-a11y@^10 msw msw-storybook-addon
npx msw init public/ --save
```

Modulul `@nuxtjs/storybook` suportă Nuxt 4 cu Storybook 10 și aduce framework-ul `@storybook-vue/nuxt` (NuxtLink, NuxtImg, useI18n și auto-importurile merg fără mock-uri). Cere Node 22.12+; repo-ul are deja 22.19+.

Adaugă în package.json:

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

## Verificat în repo (2026-10-01)

- Nuxt 4.5.2 → `@nuxtjs/storybook` cu Storybook 10. Tipurile `Meta`/`StoryObj` se importă din `@storybook-vue/nuxt`.
- ProjectsFilterChips folosește direct `SERVICE_TAG_IDS` din `layers/core/shared/types/service-tag.ts`.
- ConsentBanner șterge cookie-ul `CONSENT_COOKIE_NAME` (`codepedia_consent`) din `layers/consent/domain/consent.ts`.
- ProjectsCard primește un obiect tipat `MappedProjectCard` complet (inclusiv `serviceTag`, `featured`).

Rămâne de rulat local: `npm run storybook` și un pas de lint/typecheck.

## Acoperire

- UI (9): AppButton, TechChip, SectionLabel, FactCard, TableRow, MediaFrame, SiteSection, PageHero, CoreHoneypotField
- Domeniu (4): ProjectsCard, ProjectsFilterChips, QualifierOptionCard, ConsentBanner
- Shell și formulare (3): SiteHeader, LeadsContactForm, QualifierModal

- `useQualifierDialog()` ține `isOpen` în `useState('qualifier:open')`, deci e ref scriibil. Story-ul apelează `open()` după mount, ca să pornească watcher-ele (reset, blocare scroll, focus trap).
- QualifierModal trimite la `/api/contact` (`postQualification`), nu la `/api/leads`. Formularul de contact trimite la `/api/leads`.
- Mock-uri MSW per story: LeadsContactForm are Default, Invalid, Pending, Success, ErrorRateLimited (429), ErrorServer (400); QualifierModal are StepStage, PreselectedStage (`C`), SubmitError.

Referința vizuală: Codepedia Design System.dc.html din proiectul de design.
