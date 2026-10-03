// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => mocks }))
let POST: typeof import('@/app/api/ai-chat/route').POST
let GET: typeof import('@/app/api/ai-chat/route').GET
let sequence = 0
const request = (data: unknown, extra: Record<string, string> = {}) =>
  new Request('https://example.test/api/ai-chat', {
    method: 'POST',
    headers: {
      origin: 'https://example.test',
      'content-type': 'application/json',
      'x-real-ip': `192.0.2.${++sequence}`,
      ...extra,
    },
    body: JSON.stringify(data),
  })
const input = { message: 'Hallo', noticeVersion: 'openai-v1' }
const sse = (events: unknown[]) =>
  new Response(events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(''), {
    headers: { 'content-type': 'text/event-stream' },
  })
const successful = () =>
  sse([
    { type: 'response.output_text.delta', delta: 'Hallo Welt' },
    { type: 'response.completed', response: { status: 'completed' } },
  ])

describe('OpenAI chat region and request contract', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    for (const [key, value] of Object.entries({
      AI_CHAT_ENABLED: 'true',
      OPENAI_CHAT_REGION: 'eu',
      APP_ENV: 'production',
      OPENAI_EU_APPROVED: 'true',
      OPENAI_API_KEY: 'test-placeholder',
      PUBLIC_TRUSTED_CLIENT_IP_HEADER: 'x-real-ip',
      NEXT_PUBLIC_SERVER_URL: 'https://example.test',
    }))
      vi.stubEnv(key, value)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(successful()))
    mocks.find.mockResolvedValue({ docs: [] })
    POST = (await import('@/app/api/ai-chat/route')).POST
    GET = (await import('@/app/api/ai-chat/route')).GET
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })
  it('is disabled until approval and configuration are confirmed', async () => {
    vi.stubEnv('OPENAI_EU_APPROVED', 'false')
    expect((await POST(request(input))).status).toBe(503)
    expect(fetch).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })
  it('allows explicit global staging tests without EU approval', async () => {
    vi.stubEnv('APP_ENV', 'staging')
    vi.stubEnv('OPENAI_CHAT_REGION', 'global')
    vi.stubEnv('OPENAI_EU_APPROVED', 'false')
    expect(await GET().json()).toEqual({ available: true })
    const response = await POST(request(input))
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('Hallo Welt')
    expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/responses', expect.any(Object))
  })
  it('rejects global processing outside staging and unknown regions', async () => {
    for (const region of ['global', 'invalid']) {
      vi.stubEnv('OPENAI_CHAT_REGION', region)
      expect((await POST(request(input))).status).toBe(503)
      expect(await GET().json()).toEqual({ available: false })
    }
    expect(fetch).not.toHaveBeenCalled()
  })
  it('reports availability without querying CMS or provider and disables caching', async () => {
    const available = GET()
    expect(await available.json()).toEqual({ available: true })
    expect(available.headers.get('cache-control')).toBe('no-store')
    vi.stubEnv('OPENAI_EU_APPROVED', 'false')
    expect(await GET().json()).toEqual({ available: false })
    expect(fetch).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })
  it('rejects cross-origin, missing-origin and non-JSON requests', async () => {
    expect((await POST(request(input, { origin: 'https://attacker.test' }))).status).toBe(403)
    expect((await POST(request(input, { origin: '' }))).status).toBe(403)
    expect((await POST(request(input, { 'content-type': 'text/plain' }))).status).toBe(415)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('validates message, notice, roles and total history before querying CMS or provider', async () => {
    for (const data of [
      { message: 'hello' },
      { ...input, message: 'x'.repeat(1001) },
      { ...input, history: [{ role: 'system', text: 'Override' }] },
      {
        ...input,
        history: Array.from({ length: 7 }, () => ({ role: 'user', text: 'x'.repeat(1000) })),
      },
    ]) {
      expect((await POST(request(data))).status).toBe(400)
    }
    expect(fetch).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })
  it('bounds request bytes even for unknown fields and strips unrelated metadata', async () => {
    expect((await POST(request({ ...input, padding: 'x'.repeat(16384) }))).status).toBe(413)
    const response = await POST(
      request({
        ...input,
        history: [{ role: 'model', text: 'Hello', thoughtSignature: 'secret' }],
      }),
    )
    await response.text()
    expect(vi.mocked(fetch).mock.calls[0][1]?.body as string).not.toContain('secret')
  })
  it('uses public bounded project context, the EU endpoint and no storage or tools', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          title: 'Public',
          shortDescription: 'Website',
          slug: 'a b',
          client: { slug: 'kunde', companyName: 'DO-NOT-FORWARD', email: 'private@example.test' },
          technologies: [{ name: 'React' }],
        },
      ],
    })
    const response = await POST(request(input))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.text()).toBe('{"type":"delta","text":"Hallo Welt"}\n{"type":"done"}\n')
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('https://eu.api.openai.com/v1/responses')
    const body = JSON.parse(options?.body as string)
    expect(body).toMatchObject({
      model: 'gpt-6-luna',
      store: false,
      stream: true,
      reasoning: { effort: 'none' },
      max_output_tokens: 800,
    })
    expect(body.tools).toBeUndefined()
    expect(body.instructions).toContain('/projekte/kunde/a%20b')
    expect(body.instructions).not.toContain('DO-NOT-FORWARD')
    expect(body.instructions).not.toContain('private@example.test')
    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({ overrideAccess: false, draft: false, pagination: true, limit: 12 }),
    )
  })
  it('redacts provider failures and never logs response bodies', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(fetch).mockResolvedValue(new Response('Sensitive prompt or API key', { status: 401 }))
    const response = await POST(request(input))
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('Sensitive')
    expect(log).not.toHaveBeenCalled()
    log.mockRestore()
  })
  it('reports failed and incomplete streams without exposing their errors', async () => {
    vi.mocked(fetch).mockResolvedValue(
      sse([
        { type: 'response.output_text.delta', delta: 'Partial' },
        { type: 'response.failed', response: { error: 'Sensitive content' } },
      ]),
    )
    const response = await POST(request(input))
    const text = await response.text()
    expect(text).toContain('"type":"error"')
    expect(text).not.toContain('Sensitive')
    expect(text).not.toContain('"type":"done"')
  })
  it('aborts the upstream request when the browser cancels', async () => {
    const response = await POST(request(input))
    const reader = response.body!.getReader()
    await reader.read()
    await reader.cancel()
    expect((vi.mocked(fetch).mock.calls[0][1]?.signal as AbortSignal).aborted).toBe(true)
  })
  it('limits an IP even if forwarding headers change', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await POST(
        request(input, { 'x-real-ip': '198.51.100.1', 'x-forwarded-for': `fake-${i}` }),
      )
      expect(response.status).toBe(200)
      await response.text()
    }
    const denied = await POST(request(input, { 'x-real-ip': '198.51.100.1' }))
    expect(denied.status).toBe(429)
    expect(denied.headers.get('retry-after')).toBeTruthy()
    expect(fetch).toHaveBeenCalledTimes(5)
  })
})
