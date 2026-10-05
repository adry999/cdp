import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import { onMounted } from 'vue'
import { delay, http, HttpResponse } from 'msw'
import QualifierModal from './QualifierModal.vue'
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'
import type { StageId } from '#layers/core/shared/types/service-stage'

// Verified in the repo: useQualifierDialog() keeps isOpen in useState('qualifier:open'), a writable ref.
// We call open() after mount (not isOpen = true in setup) so the watchers in QualifierModal
// and useQualifierFlow fire: flow reset, scroll lock, focus trap.
// The modal submits through postQualification() → $fetch('/api/contact'), NOT /api/leads.
const contactOk = http.post('/api/contact', async () => { await delay(400); return HttpResponse.json({ success: true }) })
const contactFail = http.post('/api/contact', async () => { await delay(300); return HttpResponse.json({ statusMessage: 'Error' }, { status: 500 }) })

const openWith = (stage: StageId | '') => () => ({
  setup() {
    const dialog = useQualifierDialog()
    dialog.close()
    onMounted(() => dialog.open(stage))
  },
  template: '<div style="min-height:100vh"><story /></div>',
})

const meta = {
  title: 'Qualifier/QualifierModal',
  component: QualifierModal,
  parameters: { layout: 'fullscreen', msw: { handlers: [contactOk] } },
  decorators: [openWith('')],
} satisfies Meta<typeof QualifierModal>
export default meta
type Story = StoryObj<typeof meta>

// Step 1, nothing selected.
export const StepStage: Story = {}

// Opened from the homepage growth timeline with a stage preselected (STAGE_IDS: A–E).
export const PreselectedStage: Story = { decorators: [openWith('C')] }

// Walk through the steps manually; submit shows the error state.
export const SubmitError: Story = { parameters: { msw: { handlers: [contactFail] } } }
