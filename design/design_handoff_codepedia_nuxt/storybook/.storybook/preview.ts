import type { Preview } from '@storybook-vue/nuxt'
import { initialize, mswLoader } from 'msw-storybook-addon'
import '../app/assets/css/main.css'

// Intercepts $fetch('/api/leads') and $fetch('/api/contact') per story (parameters.msw.handlers).
// Unhandled requests pass through, so stories without handlers behave as before.
initialize({ onUnhandledRequest: 'bypass' })

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#FAF8F4' },
        { name: 'ink', value: '#0B0B0B' },
        { name: 'hatch', value: '#F1EEE7' },
      ],
    },
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
}
export default preview
