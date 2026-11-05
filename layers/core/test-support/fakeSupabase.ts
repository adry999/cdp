export interface FakeResult {
  data?: unknown
  error?: { message: string; code?: string } | null
  count?: number | null
}

export interface RecordedCall {
  /** `table.op` (op = insert | update | delete | select) or `rpc.<name>`. */
  key: string
  /** Every builder method called, in order, e.g. `['update', [{...}]]`, `['eq', ['id', 'x']]`. */
  chain: Array<[method: string, args: unknown[]]>
}

/**
 * Minimal in-memory stand-in for the Supabase query builder. Every chained method returns the
 * builder; awaiting it yields the next scripted result for its key (the last one repeats).
 * The op of a query is the first insert/update/delete called after `from`, otherwise `select`.
 */
export function createFakeSupabase() {
  const scripts = new Map<string, FakeResult[]>()
  const calls: RecordedCall[] = []

  function next(key: string): Required<FakeResult> {
    const queue = scripts.get(key)
    const result = queue && queue.length > 1 ? queue.shift() : queue?.[0]
    return { data: null, error: null, count: null, ...result }
  }

  function builder(table: string) {
    const call: RecordedCall = { key: `${table}.select`, chain: [] }
    let opChosen = false
    calls.push(call)
    const proxy: unknown = new Proxy(
      {},
      {
        get(_target, method: string) {
          if (method === 'then') {
            return (resolve: (value: unknown) => unknown) => resolve(next(call.key))
          }
          return (...args: unknown[]) => {
            call.chain.push([method, args])
            if (!opChosen && ['insert', 'update', 'delete'].includes(method)) {
              opChosen = true
              call.key = `${table}.${method}`
            }
            return proxy
          }
        },
      },
    )
    return proxy
  }

  const client = {
    from: (table: string) => builder(table),
    rpc: (name: string, ...args: unknown[]) => {
      calls.push({ key: `rpc.${name}`, chain: [['rpc', args]] })
      return Promise.resolve(next(`rpc.${name}`))
    },
  }

  return {
    client,
    calls,
    /** Scripts the results for a key; successive awaits consume them in order. */
    script(key: string, ...results: FakeResult[]) {
      scripts.set(key, [...results])
    },
    callsFor: (key: string) => calls.filter((call) => call.key === key),
    /** Methods called on the query for a key, e.g. `['update', 'eq']`. */
    chainOf: (key: string) => calls.find((call) => call.key === key)?.chain ?? [],
  }
}
