import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import TableRow from './TableRow.vue'

const meta = {
  title: 'UI/TableRow',
  component: TableRow,
  args: { label: 'Frontend', labelWidth: '200px', last: false, inverted: false },
  render: (args) => ({ components: { TableRow }, setup: () => ({ args }), template: '<TableRow v-bind="args">Nuxt 4, Tailwind</TableRow>' }),
} satisfies Meta<typeof TableRow>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Last: Story = { args: { last: true } }
export const Inverted: Story = { args: { inverted: true, last: true }, parameters: { backgrounds: { default: 'ink' } } }
export const Table: Story = {
  render: () => ({ components: { TableRow }, template: '<div><TableRow label="Frontend">Nuxt 4, Tailwind</TableRow><TableRow label="Backend">Supabase, Postgres</TableRow><TableRow label="Hosting" last>Vercel</TableRow></div>' }),
}
