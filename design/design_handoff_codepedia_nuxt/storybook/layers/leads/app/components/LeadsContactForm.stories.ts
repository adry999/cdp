import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import { delay, http, HttpResponse } from 'msw'
import LeadsContactForm from './LeadsContactForm.vue'

// useLeadSubmission() validates on the client, then postLead() calls $fetch('/api/leads').
// Server contract (layers/leads/server/api/leads.post.ts): 200 { success: true }, 400 invalid, 429 rate limited.
const ok = http.post('/api/leads', async () => { await delay(400); return HttpResponse.json({ success: true }) })
const pending = http.post('/api/leads', async () => { await delay('infinite'); return HttpResponse.json({}) })
const rateLimited = http.post('/api/leads', async () => { await delay(300); return HttpResponse.json({ statusMessage: 'Too many requests' }, { status: 429 }) })
const serverError = http.post('/api/leads', async () => { await delay(300); return HttpResponse.json({ statusMessage: 'Invalid submission' }, { status: 400 }) })

function fillAndSubmit(root: HTMLElement) {
  const set = (sel: string, value: string) => {
    const el = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(sel)
    if (!el) return
    el.value = value
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  set('#lead-name', 'Ion Popescu')
  set('#lead-email', 'ion@example.com')
  set('#lead-message', 'Avem nevoie de un site cu programări online.')
  root.querySelector<HTMLFormElement>('form')?.requestSubmit()
}

const meta = {
  title: 'Leads/LeadsContactForm',
  component: LeadsContactForm,
  decorators: [() => ({ template: '<div style="max-width:600px;padding:24px"><story /></div>' })],
  parameters: { msw: { handlers: [ok] } },
} satisfies Meta<typeof LeadsContactForm>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Client-side validation only; no request is sent.
export const Invalid: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLFormElement>('form')?.requestSubmit()
  },
}

export const Pending: Story = {
  parameters: { msw: { handlers: [pending] } },
  play: async ({ canvasElement }) => fillAndSubmit(canvasElement),
}

export const Success: Story = {
  play: async ({ canvasElement }) => fillAndSubmit(canvasElement),
}

export const ErrorRateLimited: Story = {
  parameters: { msw: { handlers: [rateLimited] } },
  play: async ({ canvasElement }) => fillAndSubmit(canvasElement),
}

export const ErrorServer: Story = {
  parameters: { msw: { handlers: [serverError] } },
  play: async ({ canvasElement }) => fillAndSubmit(canvasElement),
}
