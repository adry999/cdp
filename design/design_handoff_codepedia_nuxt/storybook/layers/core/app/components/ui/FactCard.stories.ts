import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FactCard from './FactCard.vue'

const meta = { title: 'UI/FactCard', component: FactCard, args: { label: 'Durată', value: '10 săptămâni' } } satisfies Meta<typeof FactCard>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Grid: Story = {
  render: () => ({ components: { FactCard }, template: '<div class="grid grid-cols-3 gap-3"><FactCard label="Client" value="Firmă de transport" /><FactCard label="Durată" value="10 săptămâni" /><FactCard label="Țară" value="România" /></div>' }),
}
