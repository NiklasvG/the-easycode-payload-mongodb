import React from 'react'
import { renderToString } from 'react-dom/server'
import { expect, it } from 'vitest'
import { RotatingText } from '@/components/shared/Animation/AnimatedText'

it('server-renders visible hero content before JavaScript and keeps controls outside its heading', () => {
  const html = new DOMParser().parseFromString(
    renderToString(
      React.createElement(RotatingText, {
        title: 'aus Dresden',
        phrases: ['Webentwicklung', 'Individuelle Anwendungen für Ihr Unternehmen'],
      }),
    ),
    'text/html',
  )
  const heading = html.querySelector('h1')!
  expect(heading.getAttribute('aria-label')).toBe('Webentwicklung aus Dresden')
  expect(heading.querySelector('button')).toBeNull()
  const currentPhrase = heading.querySelector('span[style]')!
  expect(currentPhrase.textContent).toBe('Webentwicklung')
  expect(currentPhrase.getAttribute('style')).toContain('opacity:1')
  expect(html.querySelector('button')).toBeNull()
})

it('retains a CMS hero title when its optional phrase list is empty', () => {
  const html = new DOMParser().parseFromString(
    renderToString(
      React.createElement(RotatingText, {
        title: 'Webentwicklung aus Dresden',
        phrases: [],
      }),
    ),
    'text/html',
  )
  expect(html.querySelector('h1')?.getAttribute('aria-label')).toBe('Webentwicklung aus Dresden')
  expect(html.querySelector('button')).toBeNull()
})
