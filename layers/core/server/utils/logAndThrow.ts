import { createError } from 'h3'

// Public API routes were forwarding raw Postgres/PostgREST error messages (schema and
// constraint names included) to the client via statusMessage; log it and return a generic one.
export function logAndThrow(context: string, error: { message: string }): never {
  console.error(`[api] ${context}:`, error.message)
  throw createError({ statusCode: 500, statusMessage: 'Something went wrong. Please try again.' })
}
