import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import SiteSection from './SiteSection.vue'

const meta = {
  title: 'UI/SiteSection',
  component: SiteSection,
  parameters: { layout: 'fullscreen' },
  args: { number: '02', label: 'Servicii', inverted: false, padding: 'default', topBorder: true },
  argTypes: { padding: { control: 'inline-radio', options: ['hero', 'default', 'ink'] } },
  render: (args) => ({
    components: { SiteSection },
    setup: () => ({ args }),
    template: '<SiteSection v-bind="args"><h2 class="m-0 text-[40px] font-semibold tracking-[-0.02em]">Ce construim</h2><p class="mt-3 max-w-[62ch]" :class="args.inverted ? \'text-body-ink\' : \'text-muted\'">Conținutul secțiunii stă în coloana flexibilă.</p></SiteSection>',
  }),
} satisfies Meta<typeof SiteSection>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Hero: Story = { args: { padding: 'hero', topBorder: false } }
export const Inverted: Story = { args: { number: '06', label: 'Contact', inverted: true, padding: 'ink' } }
