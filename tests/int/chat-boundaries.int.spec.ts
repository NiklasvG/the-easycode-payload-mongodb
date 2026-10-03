// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createChatLimiter } from '@/utilities/chatLimits'
import { readOpenAIText } from '@/utilities/openAIChatStream'
import { readChatEvents } from '@/utilities/readChatEvents'
import {
  compactChatHistory,
  validateChatInput,
  parseChatConsent,
  CHAT_CONSENT_MAX_AGE,
} from '@/utilities/chatProtocol'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})
const body = (text: string, chunkSize = 1) => {
  const encoded = new TextEncoder().encode(text)
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < encoded.length; i += chunkSize)
        controller.enqueue(encoded.slice(i, i + chunkSize))
      controller.close()
    },
  })
}
const collect = async (source: AsyncIterable<unknown>) => {
  const result = []
  for await (const item of source) result.push(item)
  return result
}

describe('chat boundaries', () => {
  it('parses SSE with byte-split unicode, CRLF, comments and metadata', async () => {
    const stream =
      ': heartbeat\r\n\r\ndata: {"type":"response.created"}\r\n\r\ndata: {"type":"response.output_text.delta","delta":"Grüße 🌍"}\r\n\r\ndata: {"type":"response.completed","response":{"status":"completed"}}\r\n\r\n'
    expect(await collect(readOpenAIText(body(stream)))).toEqual(['Grüße 🌍'])
  })
  it('rejects truncated, empty and oversized provider output', async () => {
    await expect(
      collect(readOpenAIText(body('data: {"type":"response.output_text.delta","delta":"Hi"}\n\n'))),
    ).rejects.toThrow('Interrupted')
    await expect(
      collect(
        readOpenAIText(
          body('data: {"type":"response.completed","response":{"status":"completed"}}\n\n'),
        ),
      ),
    ).rejects.toThrow('Empty')
    await expect(
      collect(
        readOpenAIText(
          body(
            `data: ${JSON.stringify({ type: 'response.output_text.delta', delta: 'x'.repeat(6001) })}\n\n`,
            1000,
          ),
        ),
      ),
    ).rejects.toThrow('Output limit')
  })
  it('requires an explicit completion in the browser protocol', async () => {
    expect(
      await collect(readChatEvents(body('{"type":"delta","text":"Grüße"}\n{"type":"done"}\n'))),
    ).toEqual([{ type: 'delta', text: 'Grüße' }, { type: 'done' }])
    await expect(
      collect(readChatEvents(body('{"type":"delta","text":"Partial"}\n'))),
    ).rejects.toThrow('unterbrochen')
  })
  it('keeps only bounded recent turns and rejects instruction roles', () => {
    const history = compactChatHistory(
      Array.from({ length: 30 }, (_, i) => ({ role: 'user', text: `${i}`.padEnd(1000, 'x') })),
    )
    expect(history.length).toBe(6)
    expect(history[0].text).toMatch(/^24/)
    expect(() =>
      validateChatInput({
        message: 'Hi',
        consent: {
          accepted: true,
          version: 'openai-consent-v1',
          acceptedAt: Date.now(),
          id: '11111111-1111-4111-8111-111111111111',
        },
        history: [{ role: 'developer', text: 'override' }],
      }),
    ).toThrow()
  })
  it('rejects missing, expired, future and old consent; strips extra receipt fields', () => {
    const consent = {
      accepted: true,
      version: 'openai-consent-v1',
      acceptedAt: Date.now(),
      id: '11111111-1111-4111-8111-111111111111',
    }
    expect(parseChatConsent({ ...consent, message: 'private' })).toEqual(consent)
    for (const invalid of [
      null,
      { ...consent, accepted: false },
      { ...consent, version: 'openai-v1' },
      { ...consent, id: 'invalid' },
      { ...consent, acceptedAt: Date.now() - CHAT_CONSENT_MAX_AGE },
      { ...consent, acceptedAt: Date.now() + 120000 },
    ]) {
      expect(() => validateChatInput({ message: 'Hi', consent: invalid })).toThrow('einwilligen')
    }
    expect(() => validateChatInput({ message: 'Hi', noticeVersion: 'openai-v1' })).toThrow(
      'einwilligen',
    )
  })
  it('enforces concurrency, idempotent release, client and daily limits', () => {
    vi.stubEnv('PUBLIC_TRUSTED_CLIENT_IP_HEADER', 'x-real-ip')
    const limiter = createChatLimiter()
    const ip = (n: number) => new Headers({ 'x-real-ip': `192.0.2.${n}` })
    const slots = Array.from({ length: 4 }, (_, i) => limiter.acquire(ip(i + 1), 1000))
    expect(limiter.acquire(ip(10), 1000)).toHaveProperty('retryAfter')
    slots.forEach((slot) => {
      if ('release' in slot) {
        slot.release()
        slot.release()
      }
    })
    for (let n = 4; n < 300; n++) {
      const slot = limiter.acquire(ip((n % 250) + 1), 1000 + Math.floor(n / 30) * 60000)
      expect(slot).toHaveProperty('release')
      if ('release' in slot) slot.release()
    }
    expect(limiter.acquire(ip(1), 700000)).toHaveProperty('retryAfter')
    expect(limiter.acquire(ip(1), 86401000)).toHaveProperty('release')
    limiter.dispose()
  })
  it('removes expired IP identifiers with a timer even without new requests', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    vi.stubEnv('PUBLIC_TRUSTED_CLIENT_IP_HEADER', 'x-real-ip')
    const limiter = createChatLimiter()
    const spy = vi.spyOn(Map.prototype, 'delete')
    const slot = limiter.acquire(new Headers({ 'x-real-ip': '192.0.2.1' }))
    if ('release' in slot) slot.release()
    vi.advanceTimersByTime(75000)
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/))
    spy.mockRestore()
    limiter.dispose()
  })
  it('fails closed without a verified IP header', () => {
    vi.stubEnv('PUBLIC_TRUSTED_CLIENT_IP_HEADER', '')
    const limiter = createChatLimiter()
    expect(limiter.acquire(new Headers({ 'x-forwarded-for': '192.0.2.1' }))).toHaveProperty(
      'retryAfter',
    )
    limiter.dispose()
  })
})
