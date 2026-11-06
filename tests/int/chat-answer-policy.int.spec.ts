// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readCheckedChatAnswer, resolveChatAnswer } from '@/utilities/chatAnswerPolicy'

const answer = (text: string) => JSON.stringify({ category: 'easycode', answer: text })

describe('chat answer publication policy', () => {
  it.each([
    'Niklas ist Freelance Fullstack Developer in Dresden.',
    'Dazu liegen mir keine öffentlichen Angaben vor.',
    'Das Projekt nutzt React und TypeScript: [Beispiel](https://example.test/projekte/a/b).',
    'Das [Kontaktformular](/kontakt) ist der richtige Weg für deine Angebotsanfrage.',
    'Niklas is a developer from Dresden.',
  ])('preserves legitimate profile, follow-up, project and contact answers: %s', (text) => {
    expect(resolveChatAnswer(answer(text))).toBe(text)
  })

  it.each([
    '```python\nprint("hello")\n```',
    '~~~python\npass\n~~~',
    'import pygame',
    'from pathlib import Path',
    'const snake = []',
    'def snake():',
    'pip install pygame',
    'Starte mit print("hi").',
    '    snake.move()',
    '<script>alert(1)</script>',
  ])('does not publish recognizable code even if mislabeled: %s', (text) => {
    expect(resolveChatAnswer(answer(text))).toContain('keine Programmierhilfe')
  })

  it.each([
    'unstructured answer',
    '{}',
    'null',
    '[]',
    '{"category":"unknown","answer":"LEAK"}',
    '{"category":"easycode","answer":"LEAK","extra":true}',
    '{"category":"easycode","answer":123}',
    answer(''),
    answer('x'.repeat(6001)),
  ])('fails closed for invalid or refused provider responses', (raw) => {
    expect(resolveChatAnswer(raw)).toContain('öffentlichen Infos')
    expect(resolveChatAnswer(raw)).not.toContain('LEAK')
  })

  it('waits for complete output and never publishes partial JSON or answers', async () => {
    let finish: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      finish = resolve
    })
    async function* source() {
      yield '{"category":"food","answer":"DO-NOT-SHOW'
      await gate
      yield '"}'
    }
    const iterator = readCheckedChatAnswer(source())
    let published = false
    const next = iterator.next().then((value) => {
      published = true
      return value
    })
    await Promise.resolve()
    expect(published).toBe(false)
    finish()
    const result = await next
    expect(result.value).toContain('Meine Cookies')
    expect(result.value).not.toContain('DO-NOT-SHOW')
  })

  it('publishes nothing when the source fails after partial output', async () => {
    async function* source() {
      yield answer('Must not reach the browser')
      throw new Error('Interrupted response')
    }
    await expect(readCheckedChatAnswer(source()).next()).rejects.toThrow('Interrupted')
  })
})
