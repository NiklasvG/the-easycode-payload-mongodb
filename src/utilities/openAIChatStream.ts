import { CHAT_OUTPUT_CHARS } from './chatProtocol'

// Parse SSE across network chunk boundaries; never forward provider metadata/errors.
export async function* readOpenAIText(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  let outputChars = 0
  let completed = false
  try {
    while (!completed) {
      const { value, done } = await reader.read()
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true })
      pending = pending.replace(/\r\n/g, '\n')
      let boundary: number
      while ((boundary = pending.indexOf('\n\n')) >= 0) {
        const frame = pending.slice(0, boundary)
        pending = pending.slice(boundary + 2)
        const data = frame
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n')
        if (!data || data === '[DONE]') continue
        const event = JSON.parse(data) as {
          type?: string
          delta?: unknown
          response?: { status?: string }
        }
        if (
          event.type === 'response.output_text.delta' ||
          event.type === 'response.refusal.delta'
        ) {
          if (typeof event.delta !== 'string') throw new Error('Invalid stream')
          outputChars += event.delta.length
          if (outputChars > CHAT_OUTPUT_CHARS) throw new Error('Output limit')
          yield event.delta
        } else if (event.type === 'response.completed') {
          if (event.response?.status !== 'completed') throw new Error('Incomplete response')
          completed = true
          break
        } else if (['error', 'response.failed', 'response.incomplete'].includes(event.type ?? '')) {
          throw new Error('Provider stream failed')
        }
      }
      if (pending.length > 262144) throw new Error('Stream frame limit')
      if (done && !completed) throw new Error('Interrupted response')
    }
    if (!outputChars) throw new Error('Empty response')
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
