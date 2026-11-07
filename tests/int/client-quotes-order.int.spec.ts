import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, expect, it, vi } from 'vitest'
import type { Client } from '@/payload-types'

const mocks = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => mocks }))
vi.mock('@/blocks/ClientQuotes/Component.client', () => ({
  QuoteSlider: ({ quotes }: { quotes: { author: string }[] }) =>
    React.createElement(
      'ol',
      null,
      quotes.map(({ author }) => React.createElement('li', { key: author }, author)),
    ),
}))

import { ClientQuotesBlockComponent } from '@/blocks/ClientQuotes/Component'

const client = (name: string, quoteOrder?: number | null): Client => ({
  id: name,
  slug: name,
  companyName: name,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  quoteOrder,
  contacts: [{ name, comment: 'Eine Kundenstimme' }],
})

const authors = async (maxQuotes = 6) => {
  const element = await ClientQuotesBlockComponent({
    blockType: 'clientQuotes',
    backgroundVariant: 'primary',
    maxQuotes,
  })
  const document = new DOMParser().parseFromString(renderToStaticMarkup(element), 'text/html')
  return Array.from(document.querySelectorAll('li'), (item) => item.textContent)
}

beforeEach(() => vi.clearAllMocks())

it('sorts priorities before limiting quotes and retains CMS contact order', async () => {
  const first = client('first', 1)
  first.contacts = [
    { name: 'without-comment' },
    { name: 'first-contact', comment: 'Erste Stimme' },
    { name: 'second-contact', comment: 'Zweite Stimme' },
  ]
  // The prioritized client is older than the original 100-client query window.
  mocks.find.mockResolvedValue({
    docs: [...Array.from({ length: 101 }, (_, i) => client(`client-${i}`)), first],
  })
  expect(await authors(2)).toEqual(['first-contact', 'second-contact'])
  expect(mocks.find).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: 'clients',
      overrideAccess: false,
      pagination: false,
      limit: 0,
      sort: '-createdAt',
    }),
  )
})

it('treats missing and empty priorities as 5 while preserving newest-first ties', async () => {
  mocks.find.mockResolvedValue({
    docs: [
      client('later', 8),
      client('legacy'),
      client('default', 5),
      client('cleared', null),
      client('first', 0),
    ],
  })
  expect(await authors()).toEqual(['first', 'legacy', 'default', 'cleared', 'later'])
})
