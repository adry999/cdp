// Admin-only entry of the layer. Kept apart from index.ts so the public barrel never pulls
// the leads admin repository (and with it supabase-js) into the public client chunks.
export { useNewLeadsCount } from './state/useNewLeadsCount'
