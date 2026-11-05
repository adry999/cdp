import { createHash, createHmac } from 'node:crypto'

// Minimal S3 client (AWS Signature V4) on node:crypto and fetch: no SDK dependency. Cloudflare R2 by default;
// `endpoint` + `region` point it at any other S3-compatible store (local Supabase Storage, AWS S3, MinIO).
// Relative imports only, so scripts/ can run it with Node's type stripping.

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  /** S3 endpoint with any path prefix, e.g. `http://127.0.0.1:55321/storage/v1/s3`. Default: the R2 endpoint of `accountId`. */
  endpoint?: string
  /** Signing region. Default `auto` (R2). */
  region?: string
}

export interface R2Deps {
  fetch?: typeof fetch
  now?: () => Date
}

export interface R2Client {
  putObject(key: string, body: Uint8Array, contentType: string): Promise<void>
  deleteObject(key: string): Promise<void>
  copyObject(sourceKey: string, destinationKey: string, contentType: string): Promise<void>
  getObject(key: string): Promise<Uint8Array>
  listObjects(prefix?: string): Promise<string[]>
}

// Keys are never overwritten, so every object is cacheable forever (Cloudflare caches only responses that carry Cache-Control).
export const IMMUTABLE = 'public, max-age=31536000, immutable'

/** Uploads are at most 8 MB from the admin; 30 s covers them on a slow uplink. */
const R2_TIMEOUT_MS = 30_000

const sha256 = (data: string | Uint8Array) => createHash('sha256').update(data).digest('hex')
const hmac = (key: string | Buffer, data: string) => createHmac('sha256', key).update(data).digest()

// SigV4 URI encoding: RFC 3986 unreserved characters stay, everything else is %XX.
const encode = (value: string) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
const encodeKey = (key: string) => key.split('/').map(encode).join('/')

export interface SignInput {
  method: string
  /** Already-encoded absolute path. */
  path: string
  query?: Record<string, string>
  /** Headers to sign, lowercase names. Must include `host` and `x-amz-date`. */
  headers: Record<string, string>
  payloadHash: string
  accessKeyId: string
  secretAccessKey: string
  region: string
  service: string
}

export function canonicalQuery(query: Record<string, string> = {}): string {
  return Object.entries(query)
    .map(([name, value]) => [encode(name), encode(value)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, value]) => `${name}=${value}`)
    .join('&')
}

/** Returns the `Authorization` header value. */
export function signRequest(input: SignInput): string {
  const amzDate = input.headers['x-amz-date']
  if (!amzDate) throw new Error('x-amz-date header is required to sign a request')
  const day = amzDate.slice(0, 8)
  const names = Object.keys(input.headers).sort()
  const signedHeaders = names.join(';')
  const canonicalRequest = [
    input.method,
    input.path,
    canonicalQuery(input.query),
    ...names.map((name) => `${name}:${input.headers[name]!.trim()}`),
    '',
    signedHeaders,
    input.payloadHash,
  ].join('\n')
  const scope = `${day}/${input.region}/${input.service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n')
  const signingKey = [day, input.region, input.service, 'aws4_request'].reduce<Buffer>(
    (key, part) => hmac(key, part),
    Buffer.from(`AWS4${input.secretAccessKey}`),
  )
  const signature = hmac(signingKey, stringToSign).toString('hex')
  return `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

function decodeXml(value: string): string {
  return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
}

export function createR2Client(config: R2Config, deps: R2Deps = {}): R2Client {
  const doFetch = deps.fetch ?? fetch
  const now = deps.now ?? (() => new Date())
  const endpoint = new URL(config.endpoint || `https://${config.accountId}.r2.cloudflarestorage.com`)
  const host = endpoint.host
  const prefix = endpoint.pathname.replace(/\/+$/, '')

  async function send(
    method: string,
    key: string,
    options: { query?: Record<string, string>; body?: Uint8Array; headers?: Record<string, string> } = {},
  ): Promise<Response> {
    const path = `${prefix}/${config.bucket}${key ? `/${encodeKey(key)}` : ''}`
    const payloadHash = sha256(options.body ?? '')
    const headers: Record<string, string> = {
      ...options.headers,
      host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': now().toISOString().replace(/[-:]|\.\d{3}/g, ''),
    }
    const authorization = signRequest({
      method,
      path,
      query: options.query,
      headers,
      payloadHash,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region || 'auto',
      service: 's3',
    })
    // `host` is set by fetch itself from the URL.
    const { host: _host, ...sent } = headers
    const query = canonicalQuery(options.query)
    return doFetch(`${endpoint.origin}${path}${query ? `?${query}` : ''}`, {
      method,
      headers: { ...sent, authorization },
      body: options.body as BodyInit | undefined,
      // A stalled R2 would otherwise hold the admin request (and a Hostinger process) for minutes.
      signal: AbortSignal.timeout(R2_TIMEOUT_MS),
    })
  }

  function ok(response: Response, what: string, allowed: number[] = []): Response {
    if (response.ok || allowed.includes(response.status)) return response
    throw new Error(`R2 ${what} failed with status ${response.status}`)
  }

  return {
    async putObject(key, body, contentType) {
      ok(await send('PUT', key, { body, headers: { 'content-type': contentType, 'cache-control': IMMUTABLE } }), `put ${key}`)
    },
    async deleteObject(key) {
      ok(await send('DELETE', key), `delete ${key}`, [404])
    },
    async copyObject(sourceKey, destinationKey, contentType) {
      ok(
        await send('PUT', destinationKey, {
          headers: {
            'x-amz-copy-source': `/${config.bucket}/${encodeKey(sourceKey)}`,
            'x-amz-metadata-directive': 'REPLACE',
            'content-type': contentType,
            'cache-control': IMMUTABLE,
          },
        }),
        `copy ${sourceKey}`,
      )
    },
    async getObject(key) {
      const response = ok(await send('GET', key), `get ${key}`)
      return new Uint8Array(await response.arrayBuffer())
    },
    async listObjects(prefix) {
      const keys: string[] = []
      let token: string | undefined
      do {
        const query: Record<string, string> = { 'list-type': '2' }
        if (prefix) query.prefix = prefix
        if (token) query['continuation-token'] = token
        const xml = await ok(await send('GET', '', { query }), 'list').text()
        for (const match of xml.matchAll(/<Key>([^<]*)<\/Key>/g)) keys.push(decodeXml(match[1]!))
        const next = xml.match(/<NextContinuationToken>([^<]*)<\/NextContinuationToken>/)?.[1]
        token = next ? decodeXml(next) : undefined
      } while (token)
      return keys
    },
  }
}
