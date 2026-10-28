import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'

afterEach(cleanup)

function content(fields: Record<string, unknown>): DefaultTypedEditorState {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          children: [
            {
              type: 'link',
              version: 3,
              direction: 'ltr',
              format: '',
              indent: 0,
              fields,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Weiterlesen',
                  format: 1,
                  mode: 'normal',
                  style: '',
                  detail: 0,
                },
              ],
            },
          ],
        },
      ],
    },
  } as DefaultTypedEditorState
}

it('uses the shared CMS resolver for nested pages, the homepage and posts', () => {
  const cases = [
    {
      relationTo: 'pages',
      value: { id: 'child', slug: 'child', breadcrumbs: [{ url: '/parent/child' }] },
      expected: '/parent/child',
    },
    { relationTo: 'pages', value: { id: 'home', slug: 'home' }, expected: '/' },
    {
      relationTo: 'posts',
      value: { id: 'post', slug: 'mein beitrag' },
      expected: '/posts/mein%20beitrag',
    },
  ]
  for (const { relationTo, value, expected } of cases) {
    const { unmount } = render(
      React.createElement(RichText, {
        data: content({ linkType: 'internal', doc: { relationTo, value }, newTab: false }),
      }),
    )
    expect(screen.getByRole('link', { name: 'Weiterlesen' }).getAttribute('href')).toBe(expected)
    unmount()
  }
})

it('keeps formatted link text when a CMS relationship is missing or unpopulated', () => {
  for (const doc of [
    null,
    { relationTo: 'pages', value: 'unpopulated-id' },
    { relationTo: 'pages', value: null },
    { relationTo: 'clients', value: { id: 'client', slug: 'client' } },
  ]) {
    const { unmount } = render(
      React.createElement(RichText, {
        data: content({ linkType: 'internal', doc, newTab: false }),
      }),
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Weiterlesen').closest('strong')).toBeTruthy()
    unmount()
  }
})

it('preserves custom link targets and safe new-tab attributes', () => {
  render(
    React.createElement(RichText, {
      data: content({ linkType: 'custom', url: 'https://example.test/angebot', newTab: true }),
    }),
  )
  const link = screen.getByRole('link', { name: 'Weiterlesen' })
  expect(link.getAttribute('href')).toBe('https://example.test/angebot')
  expect(link.getAttribute('target')).toBe('_blank')
  expect(link.getAttribute('rel')).toBe('noopener noreferrer')
})
