import { SYSTEM_INSTRUCTION } from '@/constants/ai-systemprompt'
import { GoogleGenAI, Chat } from '@google/genai'

// Initialize the Gemini Client
// We ensure we only create the instance if the key exists to avoid runtime crashes,
// though the prompt guarantees availability.
let ai: GoogleGenAI | null = null
try {
	if (process.env.GEMINI_API_KEY) {
		ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
	}
} catch (error) {
	console.error('Failed to initialize GoogleGenAI', error)
}

// Keep track of the chat session
let chatSession: Chat | null = null

export const getChatSession = (): Chat => {
	if (!ai) throw new Error('API Key not found')

	if (!chatSession) {
		chatSession = ai.chats.create({
			model: 'gemini-2.5-flash',
			config: {
				systemInstruction: SYSTEM_INSTRUCTION
			}
		})
	}
	return chatSession
}

export const sendMessageStream = async (message: string) => {
	const session = getChatSession()
	return session.sendMessageStream({ message })
}
