// For notifications sent after the submission is already saved: a failed or
// skipped delivery is logged instead of failing the request.
export async function notifyBestEffort<T>(
  notify: (payload: T) => Promise<'sent' | 'skipped'>,
  payload: T,
  context: string,
): Promise<void> {
  try {
    if ((await notify(payload)) === 'skipped') {
      console.warn(`[${context}] notification skipped, submission was still saved`)
    }
  } catch (error) {
    console.warn(`[${context}] team notification failed`, error instanceof Error ? error.message : error)
  }
}
