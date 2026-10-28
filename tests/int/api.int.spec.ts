// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import sharp from 'sharp'
let payload: Payload
const enabled = process.env.TEST_DATABASE === 'true'
const context = { disableRevalidate: true }
const created: { collection: 'pages' | 'clients' | 'users' | 'media'; id: string }[] = []

describe.skipIf(!enabled)('isolated CMS lifecycle', () => {
  beforeAll(async () => {
    const uri = new URL(process.env.MONGODB_URI || '')
    if (!['127.0.0.1', 'localhost'].includes(uri.hostname) || uri.pathname !== '/easycode_test') throw new Error('Only local easycode_test database allowed')
    const { getPayload } = await import('payload')
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    await Promise.all(Object.values(payload.db.collections).map((model) => model.init()))
    await Promise.all(Object.values(payload.db.versions).map((model) => model.init()))
  }, 60000)
  afterAll(async () => {
    for (const doc of created.reverse()) await payload.delete({ ...doc, context })
    await payload?.destroy()
  })
  it('hides drafts, publishes, updates, withdraws and deletes pages', async () => {
    const page = await payload.create({ collection: 'pages', context, data: { title: 'Lifecycle', slug: 'lifecycle', hero: { type: 'none' }, layout: [{ blockType: 'content', columns: [] }], _status: 'draft' } })
    created.push({ collection: 'pages', id: page.id })
    const publicPages = () => payload.find({ collection: 'pages', overrideAccess: false, draft: false, where: { id: { equals: page.id } } })
    expect((await publicPages()).docs).toHaveLength(0)
    await payload.update({ collection: 'pages', id: page.id, context, data: { _status: 'published' } })
    expect((await publicPages()).docs[0]?.title).toBe('Lifecycle')
    await payload.update({ collection: 'pages', id: page.id, context, data: { title: 'Updated' } })
    expect((await publicPages()).docs[0]?.title).toBe('Updated')
    await payload.update({ collection: 'pages', id: page.id, context, data: { _status: 'draft' } })
    expect((await publicPages()).docs).toHaveLength(0)
  })
  it('requires authentication for client writes and allows editor login', async () => {
    await expect(payload.create({ collection: 'clients', overrideAccess: false, context, data: { companyName: 'Unauthorized', slug: 'unauthorized' } })).rejects.toThrow()
    const email = `editor-${Date.now()}@example.test`
    const user = await payload.create({ collection: 'users', data: { email, password: 'Test-only-editor-123!' } })
    created.push({ collection: 'users', id: user.id })
    expect((await payload.login({ collection: 'users', data: { email, password: 'Test-only-editor-123!' } })).token).toBeTruthy()
    const client = await payload.create({ collection: 'clients', overrideAccess: false, user, context, data: { companyName: 'Authorized', slug: 'authorized' } })
    created.push({ collection: 'clients', id: client.id })
  })
  it('uploads and replaces a generated raster image', async () => {
    const image = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#abcdef' } }).png().toBuffer()
    const file = { data: image, mimetype: 'image/png', name: 'lifecycle.png', size: image.length }
    const media = await payload.create({ collection: 'media', context, data: { alt: 'First' }, file })
    created.push({ collection: 'media', id: media.id })
    expect(media.width).toBe(64)
    const updated = await payload.update({ collection: 'media', id: media.id, context, data: { alt: 'Replaced' }, file: { ...file, name: 'replacement.png' } })
    expect(updated.alt).toBe('Replaced')
    expect(updated.filename).toContain('replacement')
  })
})


