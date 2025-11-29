// app/api/ai-chat/route.ts
import { GoogleGenAI } from '@google/genai'
import { SYSTEM_INSTRUCTION } from '@/constants/ai-systemprompt'

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY!
})

export async function POST(req: Request) {
	try {
		const { message } = (await req.json()) as { message?: string }

		if (!message || typeof message !== 'string') {
			return new Response(JSON.stringify({ error: 'Message is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			})
		}

		const chat = ai.chats.create({
			model: 'gemini-2.5-flash',
			config: {
				systemInstruction: SYSTEM_INSTRUCTION
			}
		})

		// ✅ Streaming vom Gemini-Client holen
		const geminiStream = await chat.sendMessageStream({ message })

		// ✅ In Web-ReadableStream “verpacken”
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder()
				try {
					for await (const chunk of geminiStream) {
						const text = chunk.text ?? ''
						if (text) {
							// Wir schicken plain Text raus; du könntest hier auch JSON-linien schicken.
							controller.enqueue(encoder.encode(text))
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
				// optional, aber hilft bei Proxies:
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
