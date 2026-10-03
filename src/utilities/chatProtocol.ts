export const CHAT_MESSAGE_CHARS = 1000
export const CHAT_HISTORY_ITEMS = 12
export const CHAT_HISTORY_CHARS = 6000
export const CHAT_OUTPUT_CHARS = 6000
export const CHAT_NOTICE_VERSION = 'openai-v1'
export type ChatTurn = { role: 'user' | 'model'; text: string }
export type ChatEvent =
  { type: 'delta'; text: string } | { type: 'done' } | { type: 'error'; message: string }

export function compactChatHistory(turns: ChatTurn[]): ChatTurn[] {
  const result: ChatTurn[] = []
  let size = 0
  for (const turn of turns.slice(-CHAT_HISTORY_ITEMS).reverse()) {
    const text = turn.text.trim().slice(0, CHAT_MESSAGE_CHARS)
    if (!text) continue
    if (size + text.length > CHAT_HISTORY_CHARS) break
    result.unshift({ role: turn.role, text })
    size += text.length
  }
  return result
}

export function validateChatInput(value: unknown): { message: string; history: ChatTurn[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Ungültige Anfrage.')
  const body = value as Record<string, unknown>
  if (body.noticeVersion !== CHAT_NOTICE_VERSION)
    throw new Error('Bitte den aktuellen Chat-Hinweis bestätigen.')
  if (body._hp !== undefined && (typeof body._hp !== 'string' || body._hp !== ''))
    throw new Error('Ungültige Anfrage.')
  if (
    typeof body.message !== 'string' ||
    !body.message.trim() ||
    body.message.length > CHAT_MESSAGE_CHARS
  )
    throw new Error(`Bitte eine Nachricht mit höchstens ${CHAT_MESSAGE_CHARS} Zeichen eingeben.`)
  if (
    body.history !== undefined &&
    (!Array.isArray(body.history) || body.history.length > CHAT_HISTORY_ITEMS)
  )
    throw new Error('Ungültiger Gesprächsverlauf.')
  const history: ChatTurn[] = []
  for (const item of (body.history ?? []) as unknown[]) {
    if (!item || typeof item !== 'object') throw new Error('Ungültiger Gesprächsverlauf.')
    const turn = item as Record<string, unknown>
    if (
      (turn.role !== 'user' && turn.role !== 'model') ||
      typeof turn.text !== 'string' ||
      !turn.text.trim() ||
      turn.text.length > CHAT_MESSAGE_CHARS
    )
      throw new Error('Ungültiger Gesprächsverlauf.')
    history.push({ role: turn.role, text: turn.text.trim() })
  }
  if (history.reduce((sum, turn) => sum + turn.text.length, 0) > CHAT_HISTORY_CHARS)
    throw new Error('Gesprächsverlauf zu lang.')
  return { message: body.message.trim(), history }
}
