import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import TechChip from './TechChip.vue'

const meta = { title: 'UI/TechChip', component: TechChip, args: { label: 'Nuxt' } } satisfies Meta<typeof TechChip>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Group: Story = {
  render: () => ({ components: { TechChip }, template: '<div class="flex flex-wrap gap-2"><TechChip label="Nuxt" /><TechChip label="Supabase" /><TechChip label="Tailwind" /><TechChip label="OpenAI" /></div>' }),
}
