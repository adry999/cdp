import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import PageHero from './PageHero.vue'

const meta = {
  title: 'UI/PageHero',
  component: PageHero,
  parameters: { layout: 'fullscreen' },
  args: { number: '01', label: 'Servicii', title: 'Aplicații web pentru firme care au depășit Excel-ul', intro: 'Construim instrumente interne, portaluri și SaaS-uri pe Nuxt și Supabase.' },
} satisfies Meta<typeof PageHero>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const LongTitle: Story = { args: { title: 'Un titlu foarte lung care testează limita de 20ch și împărțirea pe mai multe rânduri' } }
