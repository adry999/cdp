import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import { ref } from 'vue'
import CoreHoneypotField from './CoreHoneypotField.vue'

const meta = {
  title: 'UI/CoreHoneypotField',
  component: CoreHoneypotField,
  parameters: { docs: { description: { component: 'Invizibil. Un bot care completează câmpul trimite o valoare nevidă; serverul o tratează ca spam.' } } },
  render: () => ({
    components: { CoreHoneypotField },
    setup: () => ({ value: ref('') }),
    template: '<div class="relative font-mono text-xs uppercase tracking-[0.08em] text-muted"><CoreHoneypotField v-model="value" />valoare: "{{ value }}"</div>',
  }),
} satisfies Meta<typeof CoreHoneypotField>
export default meta
export const Default: StoryObj<typeof meta> = {}
