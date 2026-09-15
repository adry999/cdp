import type { HookResult } from 'nuxt/schema'
import type { StageId } from '#layers/core/shared/types/service-stage'

// Cross-layer events. A payload uses core types only, so core never imports a
// feature layer; the receiving layer's plugin validates it at runtime.
declare module '#app' {
  interface RuntimeNuxtHooks {
    'qualifier:open': (request: { stage?: StageId }) => HookResult
  }
}
