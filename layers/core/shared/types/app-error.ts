export type AppErrorCode = 'validation' | 'rate_limited' | 'not_found' | 'upstream' | 'unexpected'

export interface AppError {
  code: AppErrorCode
  message: string
  cause?: unknown
}
