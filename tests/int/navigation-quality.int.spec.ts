import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { Page, Post } from '@/payload-types'
import { resolveCMSLinkHref } from '@/utilities/resolveCMSLinkHref'

const mocks = vi.hoisted(() => ({ pathname: '/leistungen/web-entwicklung' }))
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }))
vi.mock('@/components/Logo/Logo', () => ({
  Logo: () => React.createElement('span', null, 'EasyCode'),
}))
import { HeaderNav } from '@/Header/Nav'

afterEach(cleanup)
it('resolves home, nested pages, posts and unavailable CMS relationships consistently', () => {
  expect(
    resolveCMSLinkHref({
      type: 'reference',
      reference: { relationTo: 'pages', value: { slug: 'home' } as Page },
    }),
  ).toBe('/')
  expect(
    resolveCMSLinkHref({
      type: 'reference',
      reference: {
        relationTo: 'pages',
        value: { slug: 'child', breadcrumbs: [{ url: '/parent/child' }] } as Page,
      },
    }),
  ).toBe('/parent/child')
  expect(
    resolveCMSLinkHref({
      type: 'reference',
      reference: { relationTo: 'posts', value: { slug: 'R&D' } as Post },
    }),
  ).toBe('/posts/R%26D')
  expect(
    resolveCMSLinkHref({
      type: 'reference',
      reference: { relationTo: 'pages', value: 'unavailable' },
    }),
  ).toBeNull()
})

it('marks the parent navigation active without matching similarly prefixed paths', () => {
  const data = {
    id: 'header',
    navItems: [
      { link: { type: 'custom' as const, url: '/leistungen', label: 'Leistungen' } },
      { link: { type: 'custom' as const, url: '/leistung', label: 'Andere' } },
    ],
  }
  const view = render(React.createElement(HeaderNav, { data }))
  expect(view.getAllByRole('link', { name: 'Leistungen' })[0].getAttribute('aria-current')).toBe(
    'page',
  )
  expect(view.getAllByRole('link', { name: 'Andere' })[0].getAttribute('aria-current')).toBeNull()
  expect(view.container.querySelector('a button, button a')).toBeNull()
})

it('opens the native mobile dialog and restores page scrolling when closed', () => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  })
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
  const view = render(React.createElement(HeaderNav, { data: { id: 'header', navItems: [] } }))
  fireEvent.click(view.getByRole('button', { name: 'Menü öffnen' }))
  expect(view.getByRole('dialog', { name: 'Navigation' }).hasAttribute('open')).toBe(true)
  expect(document.body.style.overflow).toBe('hidden')
  fireEvent.click(view.getByRole('button', { name: 'Menü schließen' }))
  expect(document.body.style.overflow).toBe('')
  expect(document.activeElement).toBe(view.getByRole('button', { name: 'Menü öffnen' }))
})
