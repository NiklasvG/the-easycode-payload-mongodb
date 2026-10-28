import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import ServiceCard from '@/components/Cards/ServiceCard'
import { Card } from '@/components/Card'
import MasonryGrid from '@/components/layout/MasonryGrid'
import { ProjectsGridBlockComponent } from '@/blocks/ProjectsGrid/Component'
import type { Media, ProjectsGridBlock } from '@/payload-types'

vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.ComponentProps<'a'>) =>
    React.createElement('a', props, children),
}))
vi.mock('next/dynamic', () => ({ default: () => () => null }))
vi.mock('@/components/Media', () => ({ Media: () => React.createElement('img', { alt: '' }) }))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', () => ({
  getPayload: async () => ({
    find: async () => ({
      docs: [
        {
          id: 'missing-client',
          title: 'Projekt ohne Kunde',
          slug: 'projekt',
          client: null,
          shortDescription: 'Bestehender Inhalt',
        },
      ],
    }),
  }),
}))

afterEach(cleanup)

const serviceProps: React.ComponentProps<typeof ServiceCard> = {
  enableLink: true,
  link: { type: 'custom', url: '/leistungen', label: '' },
  headline: 'Barrierefreie Webentwicklung',
  abstract: 'Alle Inhalte bleiben auch auf kleinen Bildschirmen vorhanden.',
  tags: ['R&D', 'ÄÖÜ'],
}

it('keeps a card heading accessible when the CMS link label is empty or its target is missing', () => {
  const { rerender } = render(React.createElement(ServiceCard, serviceProps))
  expect(screen.getByRole('link', { name: serviceProps.headline }).getAttribute('href')).toBe(
    '/leistungen',
  )
  expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(serviceProps.headline)
  expect(screen.getByText(serviceProps.abstract).closest('[class*="hidden"]')).toBeNull()
  rerender(
    React.createElement(ServiceCard, {
      ...serviceProps,
      link: {
        type: 'reference',
        label: '',
        reference: { relationTo: 'pages', value: 'unpopulated-id' },
      },
    }),
  )
  expect(screen.queryByRole('link')).toBeNull()
  expect(screen.getByRole('heading', { name: serviceProps.headline })).toBeTruthy()
})

it('associates image hints with the trigger and dismisses them with Escape', () => {
  render(
    React.createElement(ServiceCard, {
      ...serviceProps,
      image: { url: '/test.webp' } as Media,
      imageHint: 'Der Screenshot zeigt einen älteren Projektstand.',
    }),
  )
  const trigger = screen.getByRole('button', { name: 'Hinweis zum Vorschaubild anzeigen' })
  fireEvent.focus(trigger)
  const tooltip = screen.getByRole('tooltip')
  expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)
  expect(tooltip.parentElement).toBe(document.body)
  fireEvent.keyDown(trigger, { key: 'Escape' })
  expect(screen.queryByRole('tooltip')).toBeNull()
})

it('never creates undefined post URLs from incomplete card data', () => {
  const { rerender } = render(React.createElement(Card, { title: 'Noch ohne Ziel' }))
  expect(screen.queryByRole('link')).toBeNull()
  expect(screen.getByRole('heading', { name: 'Noch ohne Ziel' })).toBeTruthy()
  rerender(React.createElement(Card, { doc: { title: 'Beitrag', slug: 'mein beitrag' } }))
  expect(screen.getByRole('link').getAttribute('href')).toBe('/posts/mein%20beitrag')
})

it('filters projects, announces the count and recovers when the selected type disappears', () => {
  const cards = ['brand', 'shop'].map((projectType) => ({
    ...serviceProps,
    projectType,
    enableTeaserLink: true,
    headline: projectType,
    link: { type: 'custom' as const, label: projectType, url: `/${projectType}` },
  }))
  const options = [
    { value: 'brand', label: 'Websites' },
    { value: 'shop', label: 'E-Commerce' },
  ]
  const { rerender } = render(
    React.createElement(MasonryGrid, {
      cards,
      enableProjectTypeFilter: true,
      projectTypeFilterOptions: options,
    }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'E-Commerce' }))
  expect(screen.queryByRole('link', { name: 'brand' })).toBeNull()
  expect(screen.getByRole('status').textContent).toContain('1 Projekt angezeigt')
  expect(screen.getByRole('button', { name: 'E-Commerce' }).getAttribute('aria-pressed')).toBe(
    'true',
  )
  rerender(
    React.createElement(MasonryGrid, {
      cards: cards.slice(0, 1),
      enableProjectTypeFilter: true,
      projectTypeFilterOptions: options,
    }),
  )
  expect(screen.getByRole('button', { name: 'Alle' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('link', { name: 'brand' })).toBeTruthy()
})

it('renders the authored project heading and preserves incomplete projects without broken links', async () => {
  const block = await ProjectsGridBlockComponent({
    headline: 'Unsere ausgewählten Arbeiten',
    blockType: 'projectsGrid',
    link: { label: 'no-link' },
  } as ProjectsGridBlock)
  render(block)
  expect(
    screen.getByRole('heading', { name: 'Unsere ausgewählten Arbeiten', level: 2 }),
  ).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Projekt ohne Kunde', level: 3 })).toBeTruthy()
  expect(screen.queryByRole('link')).toBeNull()
})
