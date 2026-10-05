import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import { ref } from 'vue'
import QualifierOptionCard from './QualifierOptionCard.vue'

const meta = {
  title: 'Qualifier/QualifierOptionCard',
  component: QualifierOptionCard,
  args: { name: 'stage', value: 'plan', selected: false, number: '02', title: 'Am un plan clar', hint: 'Știu ce vreau, caut echipa care îl face.', meta: 'Build' },
  decorators: [() => ({ template: '<div style="max-width:520px"><story /></div>' })],
} satisfies Meta<typeof QualifierOptionCard>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { selected: true } }
export const TitleOnly: Story = { args: { hint: undefined, meta: undefined, number: undefined } }
export const Group: Story = {
  render: () => ({
    components: { QualifierOptionCard },
    setup: () => ({
      picked: ref('plan'),
      opts: [
        { value: 'idea', number: '01', title: 'Am doar o idee', hint: 'Vreau să văd dacă merită construită.', meta: 'Discovery' },
        { value: 'plan', number: '02', title: 'Am un plan clar', hint: 'Știu ce vreau, caut echipa care îl face.', meta: 'Build' },
        { value: 'live', number: '03', title: 'Am deja un produs', hint: 'Trebuie îmbunătățit sau extins.', meta: 'Iterare' },
      ],
    }),
    template: '<div class="flex flex-col gap-2.5"><QualifierOptionCard v-for="o in opts" :key="o.value" name="stage" v-bind="o" :selected="picked === o.value" @select="picked = $event" /></div>',
  }),
}
