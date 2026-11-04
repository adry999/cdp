import { describe, expect, it } from 'vitest'
import { createR2Client, signRequest } from './r2'

const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

describe('signRequest', () => {
  it('matches the AWS Signature V4 get-vanilla test vector', () => {
    const authorization = signRequest({
      method: 'GET',
      path: '/',
      headers: { host: 'example.amazonaws.com', 'x-amz-date': '20150830T123600Z' },
      payloadHash: EMPTY_HASH,
      accessKeyId: 'AKIDEXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
      region: 'us-east-1',
      service: 'service',
    })
    expect(authorization).toBe(
      'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=5fa00fa31553b73ebf1942676e86291e8372ff2a2260956d9b8aae1d763fbf31',
    )
  })
})

function setup(respond: () => Response = () => new Response('', { status: 200 })) {
  const calls: { url: string; init: RequestInit }[] = []
  const client = createR2Client(
    { accountId: 'acc', accessKeyId: 'key', secretAccessKey: 'secret', bucket: 'media' },
    {
      fetch: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} })
        return respond()
      },
      now: () => new Date('2026-11-04T10:20:30.456Z'),
    },
  )
  return { client, calls }
}

const headersOf = (call: { init: RequestInit }) => call.init.headers as Record<string, string>

describe('createR2Client', () => {
  it('puts an object at the encoded key with a signed content type', async () => {
    const { client, calls } = setup()
    await client.putObject('my project/cover (1).jpg', new Uint8Array([1, 2]), 'image/jpeg')
    expect(calls[0]!.url).toBe('https://acc.r2.cloudflarestorage.com/media/my%20project/cover%20%281%29.jpg')
    expect(calls[0]!.init.method).toBe('PUT')
    const headers = headersOf(calls[0]!)
    expect(headers['content-type']).toBe('image/jpeg')
    expect(headers['x-amz-date']).toBe('20261104T102030Z')
    expect(headers.authorization).toMatch(
      /^AWS4-HMAC-SHA256 Credential=key\/20261104\/auto\/s3\/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=[0-9a-f]{64}$/,
    )
  })

  it('deletes, treating a missing object as done', async () => {
    const { client, calls } = setup(() => new Response('', { status: 404 }))
    await client.deleteObject('a/b.png')
    expect(calls[0]!.init.method).toBe('DELETE')
    expect(calls[0]!.url).toBe('https://acc.r2.cloudflarestorage.com/media/a/b.png')
  })

  it('copies with a signed x-amz-copy-source header', async () => {
    const { client, calls } = setup()
    await client.copyObject('a b/x.jpg', 'c/y.jpg')
    expect(calls[0]!.url).toBe('https://acc.r2.cloudflarestorage.com/media/c/y.jpg')
    expect(headersOf(calls[0]!)['x-amz-copy-source']).toBe('/media/a%20b/x.jpg')
    expect(headersOf(calls[0]!).authorization).toContain('x-amz-copy-source')
  })

  it('throws on a failed request', async () => {
    const { client } = setup(() => new Response('', { status: 403 }))
    await expect(client.putObject('k', new Uint8Array(), 'image/png')).rejects.toThrow('403')
  })

  it('lists every page of a prefix', async () => {
    const pages = [
      '<R><Contents><Key>a/1.jpg</Key></Contents><Contents><Key>a/2&amp;3.jpg</Key></Contents><NextContinuationToken>t1</NextContinuationToken></R>',
      '<R><Contents><Key>a/4.jpg</Key></Contents></R>',
    ]
    const { client, calls } = setup(() => new Response(pages.shift()))
    expect(await client.listObjects('a/')).toEqual(['a/1.jpg', 'a/2&3.jpg', 'a/4.jpg'])
    expect(calls[0]!.url).toBe('https://acc.r2.cloudflarestorage.com/media?list-type=2&prefix=a%2F')
    expect(calls[1]!.url).toBe('https://acc.r2.cloudflarestorage.com/media?continuation-token=t1&list-type=2&prefix=a%2F')
  })
})
