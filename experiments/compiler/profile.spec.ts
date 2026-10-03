import React, { Profiler } from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
vi.mock('framer-motion', () => ({ motion: { div: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children) }, AnimatePresence: ({ children }: { children: React.ReactNode }) => children }))
import Baseline from '@/components/layout/MasonryGrid'
import Compiled from 'virtual:compiled-masonry-grid'
it('compares real grid filter updates with React Profiler on 60 stable cards', () => {
  const cards = Array.from({ length: 60 }, (_, index) => ({ headline: `Card ${index}`, abstract: 'Profile fixture', tags: ['TS'], projectType: index % 2 ? 'app' : 'web', enableTeaserLink: false, link: { type: 'custom' as const, label: 'Details', url: `/fixture-${index}` } }))
  const options = [{ value: 'app', label: 'Apps' }, { value: 'web', label: 'Web' }]
  const results = []
  for (let run = 0; run < 7; run++) {
    const variants = [['baseline', Baseline], ['compiler', Compiled]] as const
    for (const [name, Grid] of run % 2 ? [...variants].reverse() : variants) {
      const commits: number[] = []
      const view = render(React.createElement(Profiler, { id: name, onRender: (_id, phase, duration) => { if (phase !== 'mount') commits.push(duration) } }, React.createElement(Grid, { cards, enableProjectTypeFilter: true, projectTypeFilterOptions: options })))
      for (let cycle = 0; cycle < 5; cycle++) {
        fireEvent.click(view.getByText('Apps'))
        expect(view.getAllByText(/^Card /)).toHaveLength(30)
        fireEvent.click(view.getByText('Web'))
        expect(view.getAllByText(/^Card /)).toHaveLength(30)
        fireEvent.click(view.getByText('Alle'))
        expect(view.getAllByText(/^Card /)).toHaveLength(60)
      }
      results.push({ name, run, commits: commits.length, durationMs: commits.reduce((a,b) => a+b,0) })
      cleanup()
    }
  }
  mkdirSync('test-results', { recursive: true })
  writeFileSync('test-results/compiler-profile.json', JSON.stringify(results, null, 2))
}, 30000)
