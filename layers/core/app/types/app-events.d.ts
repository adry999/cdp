import type { HookResult } from 'nuxt/schema'
import type { StageId } from '#layers/core/shared/types/service-stage'

// Cross-layer events. A payload uses core types only, so core never imports a
// feature layer; the receiving layer's plugin validates it at runtime.
declare module '#app' {
  interface RuntimeNuxtHooks {
    'qualifier:open': (request: { stage?: StageId }) => HookResult
    /** A product analytics event; `layers/consent` forwards it to GA once the visitor allows analytics. */
    'analytics:event': (event: { name: string; params: Record<string, string> }) => HookResult
  }
}
