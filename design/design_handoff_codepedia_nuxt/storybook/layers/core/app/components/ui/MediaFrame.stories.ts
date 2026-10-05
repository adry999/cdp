import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import MediaFrame from './MediaFrame.vue'

const meta = {
  title: 'UI/MediaFrame',
  component: MediaFrame,
  args: { ratio: '16/10', label: 'Dashboard curse' },
  argTypes: { ratio: { control: 'inline-radio', options: ['16/9', '16/10', '4/3'] }, loading: { control: 'inline-radio', options: ['lazy', 'eager'] } },
  decorators: [() => ({ template: '<div style="max-width:480px"><story /></div>' })],
} satisfies Meta<typeof MediaFrame>
export default meta
type Story = StoryObj<typeof meta>

export const Placeholder: Story = {}
export const Ratio169: Story = { args: { ratio: '16/9', label: '16/9' } }
export const Ratio43: Story = { args: { ratio: '4/3', label: '4/3' } }
export const WithImage: Story = { args: { src: '/og-image.png', alt: 'Captură de ecran', label: undefined } }
