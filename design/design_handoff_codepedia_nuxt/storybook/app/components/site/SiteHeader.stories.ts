import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import SiteHeader from './SiteHeader.vue'

const meta = {
  title: 'Site/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteHeader>
export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {}
export const Mobile: Story = { globals: { viewport: { value: 'mobile1' } } }
export const MobileMenuOpen: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button[aria-controls="site-mobile-menu"]')?.click()
  },
}
