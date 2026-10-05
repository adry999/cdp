import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import ConsentBanner from './ConsentBanner.vue'
import { CONSENT_COOKIE_NAME } from '#layers/consent/domain/consent'

// The banner only renders when useCookieConsent().showBanner is true (no stored consent).
// Clears the codepedia_consent cookie before each story so it always shows.
const meta = {
  title: 'Consent/ConsentBanner',
  component: ConsentBanner,
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => {
      document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; path=/`
      return { template: '<div style="min-height:240px"><story /></div>' }
    },
  ],
} satisfies Meta<typeof ConsentBanner>
export default meta
export const Default: StoryObj<typeof meta> = {}
