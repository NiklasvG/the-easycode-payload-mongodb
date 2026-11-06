import { CHAT_OUTPUT_CHARS } from './chatProtocol'

const redirects = {
  code_request:
    'Die Tasten überlasse ich Niklas: Hier gibt es keine Programmierhilfe oder Codeausgabe. Ich kann dir aber zeigen, welche Webanwendungen und Projekte er umsetzt. Was interessiert dich daran?',
  food: 'Meine Cookies wohnen im Browser, nicht im Backofen. Bei EasyCode kenne ich mich dafür mit Webprojekten aus. Möchtest du mehr über Niklas’ Websites oder Onlineshops erfahren?',
  off_topic:
    'Da bin ich außerhalb meiner Route gelandet. Mein Revier ist EasyCode: Niklas, seine Leistungen, öffentliche Projekte und die Orientierung auf dieser Website. Was möchtest du dazu wissen?',
  boundary:
    'Ich bleibe bei den öffentlichen Infos zu EasyCode und Niklas. Ich helfe dir gern bei seinen Leistungen, Projekten oder der Orientierung auf der Website.',
} as const

export const CHAT_ANSWER_FORMAT = {
  type: 'json_schema',
  name: 'easycode_answer',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['easycode', ...Object.keys(redirects)] },
      answer: { type: 'string' },
    },
    required: ['category', 'answer'],
    additionalProperties: false,
  },
} as const

// No partial model output reaches the browser. Invalid/refused output fails closed.
// These syntax checks are defense in depth, not a complete semantic classifier.
export function resolveChatAnswer(raw: string): string {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return redirects.boundary
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return redirects.boundary
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).length !== 2 ||
    typeof record.category !== 'string' ||
    typeof record.answer !== 'string'
  )
    return redirects.boundary
  if (Object.hasOwn(redirects, record.category))
    return redirects[record.category as keyof typeof redirects]
  if (record.category !== 'easycode') return redirects.boundary
  const answer = record.answer.trim()
  if (!answer || answer.length > CHAT_OUTPUT_CHARS) return redirects.boundary
  if (
    /`|~~~|<\/?[a-z][^>]*>|(?:^|\n)(?: {4}|\t)\S/im.test(record.answer) ||
    /(?:\bimport\s+\w+|\bfrom\s+[\w.]+\s+import\b|\b(?:const|let|var|def|class|function)\s+\w+\s*[=(:{]|\b(?:pip|npm|pnpm|yarn|sudo|curl)\s+|=>|console\.log\s*\(|print\s*\(|pygame\.)/i.test(
      answer,
    )
  )
    return redirects.code_request
  return answer
}

export async function* readCheckedChatAnswer(
  source: AsyncIterable<string>,
): AsyncGenerator<string> {
  let raw = ''
  for await (const delta of source) {
    raw += delta
    if (raw.length > CHAT_OUTPUT_CHARS) throw new Error('Output limit')
  }
  yield resolveChatAnswer(raw)
}
