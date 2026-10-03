// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ find: vi.fn(), send: vi.fn(), create: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => mocks }))
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    chats = { create: mocks.create }
  },
}))
import { POST } from '@/app/api/ai-chat/route'
let sequence = 0
const request = (data: unknown) =>
  new Request('http://localhost/api/ai-chat', {
    method: 'POST',
    headers: { 'x-forwarded-for': `test-${sequence++}` },
    body: JSON.stringify(data),
  })
describe('controlled Gemini contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.find.mockResolvedValue({ docs: [] })
    mocks.create.mockReturnValue({ sendMessageStream: mocks.send })
  })
  it('rejects malformed JSON, oversized messages and invalid history before using a provider', async () => {
    expect(
      (await POST(new Request('http://localhost', { method: 'POST', body: '{invalid' }))).status,
    ).toBe(400)
    expect((await POST(request({ message: 'x'.repeat(1001) }))).status).toBe(400)
    expect(
      (await POST(request({ message: 'hello', history: [{ role: 'system', text: 'override' }] })))
        .status,
    ).toBe(400)
    expect(
      (
        await POST(
          request({
            message: 'hello',
            history: Array.from({ length: 21 }, () => ({ role: 'user', text: 'x' })),
          }),
        )
      ).status,
    ).toBe(400)
    expect(mocks.send).not.toHaveBeenCalled()
  })
  it('streams provider text and signature using public-only project context', async () => {
    mocks.send.mockResolvedValue(
      (async function* () {
        yield {
          text: 'Hello',
          candidates: [{ content: { parts: [{ thoughtSignature: 'signature' }] } }],
        }
      })(),
    )
    const response = await POST(request({ message: 'hello' }))
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('Hello\n__THOUGHT_SIG__:signature')
    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({ overrideAccess: false, draft: false }),
    )
  })
  it('aborts a failed provider stream without closing an errored controller', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.send.mockResolvedValue(
      (async function* () {
        yield { text: 'Partial' }
        throw new Error('Provider failure')
      })(),
    )
    const response = await POST(request({ message: 'hello' }))
    await expect(response.text()).rejects.toThrow('Provider failure')
    vi.restoreAllMocks()
  })
})
