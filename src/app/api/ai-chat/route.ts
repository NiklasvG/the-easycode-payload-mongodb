import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateSystemInstruction } from '@/constants/ai-systemprompt'
import { readLimitedJSON, RequestBodyError } from '@/utilities/publicRequestLimits'
import { validateChatInput, type ChatEvent } from '@/utilities/chatProtocol'
import { createChatLimiter } from '@/utilities/chatLimits'
import { readOpenAIText } from '@/utilities/openAIChatStream'

const limiter = createChatLimiter()
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
const providerEndpoint = () => {
  const region = process.env.OPENAI_CHAT_REGION || 'eu'
  if (region === 'global' && process.env.APP_ENV === 'staging')
    return 'https://api.openai.com/v1/responses'
  if (region === 'eu' && process.env.OPENAI_EU_APPROVED === 'true')
    return 'https://eu.api.openai.com/v1/responses'
  return null
}
const chatConfigured = () =>
  process.env.AI_CHAT_ENABLED === 'true' &&
  Boolean(providerEndpoint()) &&
  Boolean(process.env.OPENAI_API_KEY) &&
  Boolean(process.env.PUBLIC_TRUSTED_CLIENT_IP_HEADER)

export function GET() {
  let validOrigin = false
  try {
    validOrigin = Boolean(new URL(process.env.NEXT_PUBLIC_SERVER_URL!).origin)
  } catch {
    /* Unconfigured. */
  }
  return Response.json({ available: validOrigin && chatConfigured() }, { headers })
}
const fail = (error: string, status: number, retryAfter?: number) =>
  Response.json(
    { error },
    {
      status,
      headers: { ...headers, ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}) },
    },
  )

async function untilAbort<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw new Error('Aborted')
  let onAbort: () => void = () => {}
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        onAbort = () => reject(new Error('Aborted'))
        signal.addEventListener('abort', onAbort, { once: true })
      }),
    ])
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

export async function POST(req: Request) {
  let expectedOrigin: string
  try {
    expectedOrigin = new URL(process.env.NEXT_PUBLIC_SERVER_URL!).origin
  } catch {
    return fail('Der KI-Chat ist vorübergehend nicht verfügbar.', 503)
  }
  if (
    req.headers.get('origin') !== expectedOrigin ||
    req.headers.get('sec-fetch-site') === 'cross-site'
  )
    return fail('Diese Anfrage ist nicht erlaubt.', 403)
  // Operational switches are not proof of contractual approval.
  if (!chatConfigured())
    return fail('Der KI-Chat ist noch nicht verfügbar. Bitte nutze das Kontaktformular.', 503)
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json')
    return fail('Bitte JSON senden.', 415)
  const slot = limiter.acquire(req.headers)
  if ('retryAfter' in slot)
    return fail('Zu viele Anfragen. Bitte warte und versuche es erneut.', 429, slot.retryAfter)
  const abort = new AbortController()
  let timedOut = false
  const timeout = setTimeout(() => {
    timedOut = true
    abort.abort()
    slot.release()
  }, 45000)
  const signal = AbortSignal.any([req.signal, abort.signal])
  const cleanup = () => {
    clearTimeout(timeout)
    slot.release()
    signal.removeEventListener('abort', cleanup)
  }
  signal.addEventListener('abort', cleanup, { once: true })
  try {
    let input: ReturnType<typeof validateChatInput>
    try {
      input = validateChatInput(await readLimitedJSON(new Request(req, { signal }), 16384))
    } catch (error) {
      cleanup()
      return fail(
        error instanceof RequestBodyError
          ? error.message
          : timedOut
            ? 'Die Anfrage hat zu lange gedauert.'
            : error instanceof Error
              ? error.message
              : 'Ungültige Anfrage.',
        timedOut ? 408 : error instanceof RequestBodyError ? error.status : 400,
      )
    }
    const payload = await untilAbort(getPayload({ config: configPromise }), signal)
    const { docs: projects } = await untilAbort(
      payload.find({
        collection: 'projects',
        overrideAccess: false,
        draft: false,
        where: { _status: { equals: 'published' } },
        // pagination:false ignores limit in Payload; bound the actual database query.
        pagination: true,
        limit: 12,
        sort: '-updatedAt',
        depth: 1,
        select: {
          title: true,
          shortDescription: true,
          technologies: true,
          slug: true,
          client: true,
        },
      }),
      signal,
    )
    let contextSize = 0
    const projectContext = projects
      .flatMap((project) => {
        const client =
          project.client && typeof project.client === 'object' ? project.client : undefined
        const slug = project.slug
        if (!client?.slug || !slug) return []
        const row = JSON.stringify({
          title: project.title?.slice(0, 150),
          description: project.shortDescription?.slice(0, 400),
          technologies: project.technologies?.slice(0, 8).map((tech) => tech.name?.slice(0, 60)),
          url: `${expectedOrigin}/projekte/${encodeURIComponent(client.slug)}/${encodeURIComponent(slug)}`,
        })
        if (contextSize + row.length > 6000) return []
        contextSize += row.length
        return [row]
      })
      .join('\n')
    if (signal.aborted) throw new Error('Aborted')
    const endpoint = providerEndpoint()
    if (!endpoint) throw new Error('Provider unavailable')
    const upstream = await fetch(endpoint, {
      method: 'POST',
      signal,
      cache: 'no-store',
      redirect: 'error',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-6-luna',
        store: false,
        stream: true,
        reasoning: { effort: 'none' },
        text: { verbosity: 'low' },
        max_output_tokens: 800,
        instructions: generateSystemInstruction(projectContext),
        input: [
          ...input.history.map((turn) => ({
            role: turn.role === 'model' ? 'assistant' : 'user',
            content: turn.text,
          })),
          { role: 'user', content: input.message },
        ],
      }),
    })
    if (
      !upstream.ok ||
      !upstream.body ||
      !upstream.headers.get('content-type')?.includes('text/event-stream')
    ) {
      await upstream.body?.cancel()
      abort.abort()
      cleanup()
      // Never log provider response bodies, prompts, exception objects or headers.
      return fail(
        'Der KI-Dienst ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.',
        upstream.status === 429 ? 429 : 502,
        upstream.status === 429 ? 60 : undefined,
      )
    }
    const iterator = readOpenAIText(upstream.body)
    const encoder = new TextEncoder()
    let cancelled = false
    let finished = false
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        if (finished) return
        const emit = (event: ChatEvent) =>
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        try {
          const next = await iterator.next()
          if (cancelled) return
          if (next.done) {
            finished = true
            emit({ type: 'done' })
            controller.close()
            cleanup()
          } else emit({ type: 'delta', text: next.value })
        } catch {
          if (!cancelled) {
            emit({
              type: 'error',
              message: 'Die Antwort wurde unterbrochen. Bitte versuche es erneut.',
            })
            controller.close()
          }
          finished = true
          abort.abort()
          cleanup()
        }
      },
      cancel() {
        cancelled = true
        finished = true
        abort.abort()
        cleanup()
        void iterator.return(undefined).catch(() => {})
      },
    })
    return new Response(stream, {
      headers: {
        ...headers,
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch {
    abort.abort()
    cleanup()
    return fail(
      'Der KI-Chat ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.',
      timedOut ? 504 : 502,
    )
  }
}
