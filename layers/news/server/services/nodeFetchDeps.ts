import { lookup } from 'node:dns/promises'
import http from 'node:http'
import https from 'node:https'
import type { LookupFunction } from 'node:net'
import type { PreviewDeps, RawResponse, ResolvedAddress } from '#layers/news/server/services/previewNewsSource'

const USER_AGENT = 'CODEPEDIA link preview (+https://codepedia.studio)'

/** Decodes at most `maxBytes`, honouring a declared charset and falling back to UTF-8. */
function decode(chunks: Buffer[], contentType: string | null): string {
  const charset = /charset\s*=\s*"?([\w-]+)/i.exec(contentType ?? '')?.[1] ?? 'utf-8'
  const buffer = Buffer.concat(chunks)
  try {
    return new TextDecoder(charset).decode(buffer)
  } catch {
    return new TextDecoder('utf-8').decode(buffer)
  }
}

export const nodeFetchDeps: PreviewDeps = {
  async resolve(hostname) {
    const entries = await lookup(hostname, { all: true, verbatim: true })
    return entries.flatMap((entry): ResolvedAddress[] =>
      entry.family === 4 || entry.family === 6 ? [{ address: entry.address, family: entry.family }] : [],
    )
  },

  // The connection goes to the address the guard already vetted: the lookup hook hands it back
  // instead of resolving again, so a DNS answer that changes between check and connect cannot matter.
  get(url, pinned, signal) {
    const transport = url.protocol === 'https:' ? https : http
    const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
      if (options.all) callback(null, [{ address: pinned.address, family: pinned.family }])
      else callback(null, pinned.address, pinned.family)
    }

    return new Promise<RawResponse>((resolve, reject) => {
      const request = transport.request(
        {
          protocol: url.protocol,
          hostname: url.hostname.replace(/^\[|\]$/g, ''),
          port: url.port || undefined,
          path: `${url.pathname}${url.search}`,
          method: 'GET',
          lookup: pinnedLookup,
          signal,
          headers: {
            'user-agent': USER_AGENT,
            accept: 'text/html,application/xhtml+xml',
            // No compression: the size cap then applies to what is parsed.
            'accept-encoding': 'identity',
          },
        },
        (response) => {
          const contentType = response.headers['content-type'] ?? null
          resolve({
            status: response.statusCode ?? 0,
            location: response.headers.location ?? null,
            contentType,
            readText: (maxBytes) =>
              new Promise<string>((done, fail) => {
                const chunks: Buffer[] = []
                let size = 0
                response.on('data', (chunk: Buffer) => {
                  size += chunk.length
                  chunks.push(size > maxBytes ? chunk.subarray(0, chunk.length - (size - maxBytes)) : chunk)
                  if (size >= maxBytes) {
                    response.destroy()
                    done(decode(chunks, contentType))
                  }
                })
                response.on('end', () => done(decode(chunks, contentType)))
                response.on('error', (error) => (size >= maxBytes ? done(decode(chunks, contentType)) : fail(error)))
              }),
          })
          // A redirect or error response's body is never read.
          if ((response.statusCode ?? 0) >= 300) response.resume()
        },
      )
      request.on('error', reject)
      request.end()
    })
  },
}
