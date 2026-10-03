import React from 'react'
import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import { HeaderThemeProvider, useHeaderTheme } from '@/providers/HeaderTheme'

const HeaderProbe = () => {
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  return React.createElement(
    'header',
    { 'data-theme': headerTheme || undefined },
    React.createElement('button', { onClick: () => setHeaderTheme('dark') }, 'Override'),
  )
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  vi.restoreAllMocks()
})

it('hydrates consistently when the theme script sets dark mode before hydration', async () => {
  const tree = React.createElement(HeaderThemeProvider, null, React.createElement(HeaderProbe))
  const container = document.createElement('div')
  container.innerHTML = renderToString(tree)
  document.documentElement.setAttribute('data-theme', 'dark')
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const recoverableError = vi.fn()
  let root: ReturnType<typeof hydrateRoot> | undefined
  try {
    await act(async () => {
      root = hydrateRoot(container, tree, { onRecoverableError: recoverableError })
    })
    expect(container.querySelector('header')?.hasAttribute('data-theme')).toBe(false)
    expect(consoleError).not.toHaveBeenCalled()
    expect(recoverableError).not.toHaveBeenCalled()
    await act(async () => container.querySelector('button')!.click())
    expect(container.querySelector('header')?.getAttribute('data-theme')).toBe('dark')
  } finally {
    await act(async () => root?.unmount())
  }
})
