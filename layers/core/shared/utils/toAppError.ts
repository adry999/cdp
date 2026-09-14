import type { AppError, AppErrorCode } from '#layers/core/shared/types/app-error'

const APP_ERROR_CODES: readonly AppErrorCode[] = ['validation', 'rate_limited', 'not_found', 'upstream', 'unexpected']

const CODE_BY_STATUS: Readonly<Record<number, AppErrorCode>> = {
  400: 'validation',
  404: 'not_found',
  429: 'rate_limited',
  502: 'upstream',
}

function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof value.message === 'string' &&
    APP_ERROR_CODES.some((code) => code === value.code)
  )
}

function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined
  return typeof error.statusCode === 'number' ? error.statusCode : undefined
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error
  const statusCode = statusCodeOf(error)
  const code = statusCode === undefined ? 'unexpected' : (CODE_BY_STATUS[statusCode] ?? 'unexpected')
  const message = error instanceof Error ? error.message : 'Unexpected error'
  return { code, message, cause: error }
}
