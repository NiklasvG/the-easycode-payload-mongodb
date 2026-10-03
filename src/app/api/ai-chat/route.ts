// app/api/ai-chat/route.ts
import { GoogleGenAI } from '@google/genai'
import { generateSystemInstruction } from '@/constants/ai-systemprompt'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createRequestLimiter, hasAllowedOrigin, readLimitedJSON, RequestBodyError } from '@/utilities/publicRequestLimits'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const allowChat = createRequestLimiter(30, 5)
const MAX_MESSAGE_LENGTH = 1000

export async function POST(req: Request) {
  try {
    if (!hasAllowedOrigin(req)) return Response.json({ error: 'Origin not allowed' }, { status: 403 })
    if (!allowChat(req.headers)) return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } })
    let body: unknown
    try {
      body = await readLimitedJSON(req)
    } catch (error) {
      return Response.json({ error: error instanceof RequestBodyError ? error.message : 'Invalid JSON' }, { status: error instanceof RequestBodyError ? error.status : 400 })
    }
    if (!body || typeof body !== 'object')
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    const { message, history, _hp } = body as {
      message?: string
      history?: Array<{
        role: 'user' | 'model'
        text: string
        thoughtSignature?: string
      }>
      _hp?: string // Honeypot
    }

    // 1. Bot-Schutz (Honeypot)
    if (_hp) {
      return new Response(JSON.stringify({ error: 'Bot detected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Validierung der Nachricht
    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Nachricht zu lang (max. ${MAX_MESSAGE_LENGTH} Zeichen)` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    if (
      history !== undefined &&
      (!Array.isArray(history) ||
        history.length > 20 ||
        history.some(
          (item) =>
            !item ||
            !['user', 'model'].includes(item.role) ||
            typeof item.text !== 'string' ||
            item.text.length > MAX_MESSAGE_LENGTH ||
            (item.thoughtSignature !== undefined &&
              (typeof item.thoughtSignature !== 'string' || item.thoughtSignature.length > 16384)),
        ))
    ) {
      return Response.json({ error: 'Invalid history' }, { status: 400 })
    }

    // 1. Payload initialisieren
    const payload = await getPayload({ config: configPromise })

    // 2. Projekte aus der DB holen
    // Wir holen nur published Projekte und selektieren nur relevante Felder, um Token zu sparen
    const { docs: projects } = await payload.find({
      collection: 'projects',
      overrideAccess: false,
      draft: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      pagination: false,
      limit: 20, // Limitierung für Kontext-Größe
      depth: 1, // Damit wir Tech-Stack Namen bekommen
      select: {
        title: true,
        shortDescription: true,
        technologies: true,
        slug: true,
        client: true,
      },
    })

    // 3. Projekte als String formatieren
    const projectsContext = projects
      .map((p) => {
        // Tech Stack auflösen (falls vorhanden)
        const techStack = p.technologies?.map((t) => t.name).join(', ') || 'N/A'

        // Client Name auflösen
        let clientName = 'Kunde'
        if (p.client && typeof p.client === 'object' && 'companyName' in p.client) {
          clientName = p.client.companyName
        }

        // Optional: Link generieren, damit die KI drauf verweisen kann
        // Hinweis: Hierfür müsste man den Client-Slug kennen, wenn deine URL so aufgebaut ist.
        // Wenn client depth=1 ist, hast du Zugriff auf p.client.slug
        let projectUrl = ''
        if (p.client && typeof p.client === 'object' && 'slug' in p.client) {
          projectUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/projekte/${p.client.slug}/${p.slug}`
        }

        return `- **${p.title}** (für ${clientName}):
  Beschreibung: ${p.shortDescription}
  Tech Stack: ${techStack}
  ${projectUrl ? `Link: ${projectUrl}` : ''}`
      })
      .join('\n\n')

    // Fallback, falls keine Projekte da sind
    const finalProjectContext =
      projectsContext.length > 0 ? projectsContext : 'Keine öffentlichen Projekte gelistet.'

    // 4. Chat Session mit dynamischem Prompt starten
    // Konvertiere History für das SDK
    const convertedHistory =
      history?.map((h) => ({
        role: h.role,
        parts: [
          { text: h.text },
          ...(h.thoughtSignature ? [{ thoughtSignature: h.thoughtSignature }] : []),
        ],
      })) || []

    const abort = new AbortController()
    const signal = AbortSignal.any([req.signal, abort.signal, AbortSignal.timeout(60000)])
    const chat = ai.chats.create({
      model: 'gemini-3.1-flash-lite-preview',
      history: convertedHistory,
      config: {
        systemInstruction: generateSystemInstruction(finalProjectContext),
        abortSignal: signal,
        httpOptions: { timeout: 30000 },
        maxOutputTokens: 2048,
      },
    })

    // 5. Streaming
    const geminiStream = await chat.sendMessageStream({ message })
    const iterator = geminiStream[Symbol.asyncIterator]()
    let cancelled = false
    let thoughtSignature = ''
    const stream = new ReadableStream({
      async pull(controller) {
        const encoder = new TextEncoder()
        try {
          if (signal.aborted) { controller.close(); return }
          const { value: chunk, done } = await iterator.next()
          if (cancelled) return
          if (done) {
            if (thoughtSignature) controller.enqueue(encoder.encode(`\n__THOUGHT_SIG__:${thoughtSignature}`))
            controller.close()
            return
          }
            const text = chunk.text ?? ''
            if (text) {
              controller.enqueue(encoder.encode(text))
            }

            // Suche nach Thought Signature im Chunk
            const thoughtPart = chunk.candidates?.[0]?.content?.parts?.find(
              (p) => p.thoughtSignature,
            )
            if (thoughtPart) {
              thoughtSignature = thoughtPart.thoughtSignature?.slice(0, 16384) || ''
            }
        } catch (err) {
          if (cancelled || signal.aborted) { if (!cancelled) controller.close(); return }
          console.error('AI Stream Error:', err)
          controller.error(err)
        }
      },
      cancel() {
        cancelled = true
        abort.abort()
        void iterator.return?.(undefined).catch(() => {})
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    if (req.signal.aborted) return new Response(null, { status: 499 })
    console.error('AI Route Error:', error)
    return new Response(JSON.stringify({ error: 'Interner Fehler beim AI-Endpoint' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
