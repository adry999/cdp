import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import AppButton from './AppButton.vue'

const meta = {
  title: 'UI/AppButton',
  component: AppButton,
  args: { variant: 'ink', inverted: false, disabled: false, type: 'button' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ink', 'signal', 'outline'] },
    type: { control: 'inline-radio', options: ['button', 'submit'] },
  },
  render: (args) => ({ components: { AppButton }, setup: () => ({ args }), template: '<AppButton v-bind="args">Începe un proiect</AppButton>' }),
} satisfies Meta<typeof AppButton>
export default meta
type Story = StoryObj<typeof meta>

export const Ink: Story = {}
export const Signal: Story = { args: { variant: 'signal' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const OutlineInverted: Story = { args: { variant: 'outline', inverted: true }, parameters: { backgrounds: { default: 'ink' } } }
export const Disabled: Story = { args: { disabled: true } }
export const AsLink: Story = { args: { href: '/proiecte' } }
export const All: Story = {
  render: () => ({
    components: { AppButton },
    template: `<div class="flex flex-wrap gap-3">
      <AppButton>Ink</AppButton><AppButton variant="signal">Signal</AppButton>
      <AppButton variant="outline">Outline</AppButton><AppButton disabled>Disabled</AppButton>
    </div>`,
  }),
}
