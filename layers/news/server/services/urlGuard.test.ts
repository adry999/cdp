import { describe, expect, it } from 'vitest'
import { isPrivateAddress, parsePublicUrl } from './urlGuard'

describe('isPrivateAddress', () => {
  it.each([
    '0.0.0.0', '10.1.2.3', '127.0.0.1', '127.255.255.254', '169.254.169.254', '172.16.0.1', '172.31.255.255',
    '192.168.1.1', '100.64.0.1', '100.127.255.255', '192.0.0.8', '198.18.0.1', '224.0.0.1', '255.255.255.255',
    '::', '::1', '0:0:0:0:0:0:0:1', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'fe80::1%eth0', 'ff02::1',
    '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:a9fe:a9fe', '::ffff:10.0.0.1', '64:ff9b::7f00:1', '64:ff9b:1::1',
    '2002:7f00:1::1', '2001:db8::1', '2001:0:4136:e378:8000:63bf:3fff:fdd2', '[::1]', 'not-an-ip', '1.2.3', '256.1.1.1',
  ])('blocks %s', (address) => {
    expect(isPrivateAddress(address)).toBe(true)
  })

  it.each(['8.8.8.8', '1.1.1.1', '93.184.216.34', '172.15.0.1', '172.32.0.1', '100.63.255.255', '2606:4700:4700::1111', '::ffff:8.8.8.8', '64:ff9b::808:808'])(
    'allows %s',
    (address) => {
      expect(isPrivateAddress(address)).toBe(false)
    },
  )
})

describe('parsePublicUrl', () => {
  it('accepts an ordinary public http(s) URL', () => {
    expect(parsePublicUrl('https://www.example.com/a?b=1#c').ok).toBe(true)
    expect(parsePublicUrl('http://example.com:80/').ok).toBe(true)
    expect(parsePublicUrl('https://example.com:443/').ok).toBe(true)
    expect(parsePublicUrl('https://93.184.216.34/').ok).toBe(true)
    expect(parsePublicUrl('https://[2606:4700:4700::1111]/').ok).toBe(true)
  })

  it.each([
    ['not a url', 'invalid'],
    ['file:///etc/passwd', 'scheme'],
    ['ftp://example.com/', 'scheme'],
    ['javascript:alert(1)', 'scheme'],
    ['data:text/html,hi', 'scheme'],
    ['https://user:pw@example.com/', 'credentials'],
    ['https://example.com:8080/', 'port'],
    ['http://localhost/', 'host'],
    ['http://foo.localhost/', 'host'],
    ['http://intranet/', 'host'],
    ['http://printer.local/', 'host'],
    ['http://metadata.google.internal/', 'host'],
    ['http://127.0.0.1/', 'host'],
    ['http://127.1/', 'host'],
    ['http://2130706433/', 'host'],
    ['http://0x7f.0.0.1/', 'host'],
    ['http://0177.0.0.1/', 'host'],
    ['http://169.254.169.254/latest/meta-data/', 'host'],
    ['http://[::1]/', 'host'],
    ['http://[::ffff:127.0.0.1]/', 'host'],
    ['http://[fd00::1]/', 'host'],
    ['http://10.0.0.5/', 'host'],
  ])('rejects %s', (raw, reason) => {
    expect(parsePublicUrl(raw)).toEqual({ ok: false, reason })
  })
})
