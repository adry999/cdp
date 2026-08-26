import { createError } from 'h3'

/**
 * Public API routes were forwarding raw Postgres/PostgREST error messages to
 * the client via statusMessage — schema and constraint names included. Log
 * the real error server-side and return a generic one to the caller.
 */
export function logAndThrow(context: string, error: { message: string }): never {
  console.error(`[api] ${context}:`, error.message)
  throw createError({ statusCode: 500, statusMessage: 'Something went wrong. Please try again.' })
}
