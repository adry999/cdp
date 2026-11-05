<script setup lang="ts">
// Cloudflare Turnstile for a public form; the token goes to the API route in the x-turnstile-token header
// (layers/core/server/utils/turnstile.ts). `interaction-only`: invisible unless Cloudflare needs a click.
// Renders nothing while NUXT_PUBLIC_TURNSTILE_SITE_KEY is unset. Tokens are single-use: call reset() after a
// failed submission so the next attempt gets a fresh one.
interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string
  reset(widgetId: string): void
  remove(widgetId: string): void
}

const props = defineProps<{ action: string }>()
const token = defineModel<string>({ default: '' })

const { turnstileSiteKey } = useRuntimeConfig().public
const { locale } = useI18n()
const container = useTemplateRef<HTMLElement>('container')
let widgetId: string | undefined

const SCRIPT_ID = 'cf-turnstile-api'

function turnstileApi(): TurnstileApi | undefined {
  return (window as Window & { turnstile?: TurnstileApi }).turnstile
}

function loadTurnstile(): Promise<TurnstileApi> {
  const ready = turnstileApi()
  if (ready) return Promise.resolve(ready)
  return new Promise((resolve, reject) => {
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      document.head.append(script)
    }
    script.addEventListener('load', () => {
      const api = turnstileApi()
      if (api) resolve(api)
      else reject(new Error('Turnstile API missing after load'))
    })
    script.addEventListener('error', () => reject(new Error('Turnstile script failed to load')))
  })
}

onMounted(async () => {
  if (!turnstileSiteKey) return
  try {
    const api = await loadTurnstile()
    if (!container.value) return
    widgetId = api.render(container.value, {
      sitekey: turnstileSiteKey,
      action: props.action,
      language: locale.value,
      appearance: 'interaction-only',
      callback: (value: string) => {
        token.value = value
      },
      'expired-callback': () => {
        token.value = ''
      },
      'error-callback': () => {
        token.value = ''
      },
    })
  } catch (error) {
    // Blocked or offline: the form still submits and the server answers 403, shown as the form's error.
    console.warn('[turnstile]', error)
  }
})

onBeforeUnmount(() => {
  if (widgetId) turnstileApi()?.remove(widgetId)
})

function reset() {
  token.value = ''
  if (widgetId) turnstileApi()?.reset(widgetId)
}

defineExpose({ reset })
</script>

<template>
  <div v-if="turnstileSiteKey" ref="container" />
</template>
