// app/api/ai-chat/route.ts
import { GoogleGenAI } from '@google/genai'
import { generateSystemInstruction } from '@/constants/ai-systemprompt'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY!
})

export async function POST(req: Request) {
	try {
		const { message, history } = (await req.json()) as {
			message?: string
			history?: Array<{
				role: 'user' | 'model'
				text: string
				thoughtSignature?: string
			}>
		}

		if (!message || typeof message !== 'string') {
			return new Response(JSON.stringify({ error: 'Message is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			})
		}

		// 1. Payload initialisieren
		const payload = await getPayload({ config: configPromise })

		// 2. Projekte aus der DB holen
		// Wir holen nur published Projekte und selektieren nur relevante Felder, um Token zu sparen
		const { docs: projects } = await payload.find({
			collection: 'projects',
			where: {
				_status: {
					equals: 'published'
				}
			},
			pagination: false,
			limit: 20, // Limitierung für Kontext-Größe
			depth: 1, // Damit wir Tech-Stack Namen bekommen
			select: {
				title: true,
				shortDescription: true,
				technologies: true,
				slug: true,
				client: true
			}
		})

		// 3. Projekte als String formatieren
		const projectsContext = projects
			.map((p) => {
				// Tech Stack auflösen (falls vorhanden)
				const techStack =
					p.technologies?.map((t: any) => t.name).join(', ') || 'N/A'

				// Client Name auflösen
				let clientName = 'Kunde'
				if (
					p.client &&
					typeof p.client === 'object' &&
					'companyName' in p.client
				) {
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
			projectsContext.length > 0
				? projectsContext
				: 'Keine öffentlichen Projekte gelistet.'

		// 4. Chat Session mit dynamischem Prompt starten
		// Konvertiere History für das SDK
		const convertedHistory =
			history?.map((h) => ({
				role: h.role,
				parts: [
					{ text: h.text },
					...(h.thoughtSignature
						? [{ thoughtSignature: h.thoughtSignature } as any]
						: [])
				]
			})) || []

		const chat = ai.chats.create({
			model: 'gemini-3.1-flash-lite-preview',
			history: convertedHistory,
			config: {
				systemInstruction: generateSystemInstruction(finalProjectContext)
			}
		})

		// 5. Streaming
		const geminiStream = await chat.sendMessageStream({ message })

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder()
				try {
					for await (const chunk of geminiStream) {
						const text = chunk.text ?? ''
						if (text) {
							controller.enqueue(encoder.encode(text))
						}

						// Suche nach Thought Signature im Chunk
						const thoughtPart = chunk.candidates?.[0]?.content?.parts?.find(
							(p: any) => p.thoughtSignature
						)
						if (thoughtPart) {
							// Wir senden die Signature als speziellen Kommentar am Ende oder Metadaten
							// Da der Client einfach nur Text erwartet, hängen wir sie diskret an oder nutzen einen Delimiter
							// Da wir aber "Circulation" brauchen, muss der Client sie speichern.
							// Plan: Benutze einen Delimiter, den der Client erkennt.
							controller.enqueue(
								encoder.encode(
									`\n__THOUGHT_SIG__:${thoughtPart.thoughtSignature}`
								)
							)
						}
					}
				} catch (err) {
					console.error('AI Stream Error:', err)
					controller.error(err)
				} finally {
					controller.close()
				}
			}
		})

		return new Response(stream, {
			status: 200,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
				'Transfer-Encoding': 'chunked'
			}
		})
	} catch (error) {
		console.error('AI Route Error:', error)
		return new Response(
			JSON.stringify({ error: 'Interner Fehler beim AI-Endpoint' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		)
	}
}
