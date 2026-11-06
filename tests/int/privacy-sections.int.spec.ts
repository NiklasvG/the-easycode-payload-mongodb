// @vitest-environment node
import {describe,expect,it} from 'vitest'
import {PRIVACY_SECTIONS,privacySectionId} from '@/utilities/privacySections'
import fs from 'node:fs'

describe('published privacy section anchors',()=>{
 it('provides a stable unique anchor for every numbered privacy heading',()=>{
  const headings=[...fs.readFileSync('docs/datenschutzerklaerung.md','utf8').matchAll(/^## (.+)$/gm)].map(m=>m[1])
  expect(headings).toHaveLength(12)
  expect(headings.map(privacySectionId)).toEqual(PRIVACY_SECTIONS.map(s=>s.id))
  expect(new Set(PRIVACY_SECTIONS.map(s=>s.id)).size).toBe(12)
  expect(privacySectionId('7. KI-Chat „EasyCode AI“')).toBe('ki-chat')
  expect(privacySectionId('Unsere Projekte')).toBeUndefined()
 })
})
