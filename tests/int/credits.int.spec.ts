import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { CreditsContent, groupCreditSections } from '@/components/Credits/Content'

afterEach(cleanup)

const text = (value: string) => ({
  type: 'text',
  version: 1,
  text: value,
  format: 0,
  mode: 'normal',
  style: '',
  detail: 0,
})
const paragraph = (value: string) => ({
  type: 'paragraph',
  version: 1,
  children: [text(value)],
  direction: null,
  format: '',
  indent: 0,
})
const heading = (value: string) => ({ ...paragraph(value), type: 'heading', tag: 'h2' })
const sourceLink = {
  ...paragraph(''),
  children: [
    {
      type: 'link',
      version: 3,
      direction: null,
      format: '',
      indent: 0,
      fields: { linkType: 'custom', url: 'https://source.example/license', newTab: true },
      children: [text('Original attribution')],
    },
  ],
}
const data = {
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: [
      paragraph('Editorial introduction'),
      heading('Source one'),
      sourceLink,
      paragraph('License details remain here.'),
      heading('Source two'),
      paragraph('Second source'),
      heading('Additional source'),
      paragraph('Third source'),
    ],
  },
} as DefaultTypedEditorState

it('preserves every original node, attribution and editor field when grouping any number of sources', () => {
  const before = structuredClone(data)
  const groups = groupCreditSections(data)
  expect(groups).toHaveLength(4)
  expect(groups.flatMap((group) => group.root.children)).toEqual(data.root.children)
  expect(data).toEqual(before)
  for (const group of groups) expect(group.root.direction).toBe(data.root.direction)
})

it('handles content without headings and empty editor content', () => {
  const noHeading = {
    ...data,
    root: { ...data.root, children: [paragraph('Free-form credit')] },
  } as DefaultTypedEditorState
  expect(groupCreditSections(noHeading)).toEqual([noHeading])
  expect(groupCreditSections({ ...data, root: { ...data.root, children: [] } })).toEqual([])
  const empty = { ...paragraph(''), children: [] }
  expect(
    groupCreditSections({
      ...data,
      root: { ...data.root, children: [empty] },
    } as DefaultTypedEditorState),
  ).toEqual([])
  const leadingBlank = {
    ...data,
    root: { ...data.root, children: [empty, heading('Source'), sourceLink] },
  } as DefaultTypedEditorState
  expect(groupCreditSections(leadingBlank)).toHaveLength(1)
  expect(groupCreditSections(leadingBlank)[0].root.children).toEqual(leadingBlank.root.children)
})

it('renders CMS source text and link semantics without provider hardcodes', () => {
  render(
    React.createElement(CreditsContent, {
      blockType: 'content',
      columns: [{ size: 'full', richText: data }],
    }),
  )
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
  expect(screen.getByText('Editorial introduction')).toBeTruthy()
  expect(screen.getByText('License details remain here.')).toBeTruthy()
  const link = screen.getByRole('link', { name: 'Original attribution' })
  expect(link.getAttribute('href')).toBe('https://source.example/license')
  expect(link.getAttribute('target')).toBe('_blank')
  expect(link.getAttribute('rel')).toBe('noopener noreferrer')
})

it('keeps standalone column actions and tolerates empty blocks', () => {
  const { unmount } = render(
    React.createElement(CreditsContent, {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          enableLink: true,
          link: {
            type: 'custom',
            url: '/kontakt',
            label: 'Editorial action',
            appearance: 'default',
          },
        },
      ],
    }),
  )
  expect(screen.getByRole('link', { name: 'Editorial action' }).getAttribute('href')).toBe(
    '/kontakt',
  )
  unmount()
  const { container } = render(
    React.createElement(CreditsContent, { blockType: 'content', columns: [] }),
  )
  expect(container.innerHTML).toBe('')
})
