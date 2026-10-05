import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import SectionLabel from './SectionLabel.vue'

const meta = { title: 'UI/SectionLabel', component: SectionLabel, args: { number: '02', label: 'Servicii', inverted: false } } satisfies Meta<typeof SectionLabel>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Inverted: Story = { args: { number: '06', label: 'Contact', inverted: true }, parameters: { backgrounds: { default: 'ink' } } }
