import { type ChatEvent, CHAT_OUTPUT_CHARS } from './chatProtocol'

export async function* readChatEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  let completed = false
  let size = 0
  try {
    while (!completed) {
      const { value, done } = await reader.read()
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true })
      let newline: number
      while ((newline = pending.indexOf('\n')) >= 0) {
        const line = pending.slice(0, newline)
        pending = pending.slice(newline + 1)
        if (!line) continue
        let event: ChatEvent
        try {
          event = JSON.parse(line) as ChatEvent
        } catch {
          throw new Error('Ungültige Antwort des KI-Chats.')
        }
        if (!event || typeof event !== 'object') throw new Error('Ungültige Antwort des KI-Chats.')
        if (event.type === 'delta' && typeof event.text === 'string') {
          size += event.text.length
          if (size > CHAT_OUTPUT_CHARS) throw new Error('Die Antwort ist zu lang.')
          yield event
        } else if (event.type === 'done') {
          completed = true
          yield event
          break
        } else if (event.type === 'error') {
          throw new Error('Die Antwort wurde unterbrochen. Bitte versuche es erneut.')
        } else throw new Error('Ungültige Antwort des KI-Chats.')
      }
      if (pending.length > 32768) throw new Error('Ungültige Antwort des KI-Chats.')
      if (done && !completed)
        throw new Error('Die Verbindung wurde unterbrochen. Bitte versuche es erneut.')
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
