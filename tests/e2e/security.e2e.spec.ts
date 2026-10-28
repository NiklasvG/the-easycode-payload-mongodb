import { expect, test } from '@playwright/test'

test.describe('anonymous API boundaries', () => {
  test.skip(process.env.TEST_DATABASE !== 'true', 'Requires isolated seeded database')
  test('denies anonymous writes to CMS, globals and internal services', async ({ request }) => {
    for (const collection of ['pages', 'posts', 'projects', 'clients', 'media', 'categories', 'users', 'forms', 'redirects', 'search', 'payload-folders']) {
      const create = await request.post(`/api/${collection}`, { data: { title: 'Unauthorized', companyName: 'Unauthorized', email: 'anonymous@example.test', password: 'Not-an-editor-123!' } })
      expect([401, 403], `${collection} POST: ${await create.text()}`).toContain(create.status())
      for (const method of ['patch', 'delete'] as const) {
        const response = await request[method](`/api/${collection}?where[id][exists]=true`, { data: { title: 'Unauthorized' } })
        // Collections with disableBulkDelete reject bulk deletes before access resolution.
        expect([400, 401, 403, 405], `${collection} ${method}: ${await response.text()}`).toContain(response.status())
      }
    }
    for (const collection of ['pages', 'projects', 'clients', 'media']) {
      const docs = await (await request.get(`/api/${collection}?limit=1&depth=0`)).json()
      expect(docs.docs[0]?.id).toBeTruthy()
      for (const method of ['patch', 'delete'] as const) {
        const response = await request[method](`/api/${collection}/${docs.docs[0].id}`, { data: { title: 'Unauthorized' } })
        expect([401, 403], `${collection} individual ${method}`).toContain(response.status())
      }
    }
    for (const collection of ['pages', 'posts', 'projects']) {
      expect([401, 403]).toContain((await request.get(`/api/${collection}/versions`)).status())
    }
    for (const slug of ['header', 'footer']) {
      expect([401, 403]).toContain((await request.post(`/api/globals/${slug}`, { data: { aboutText: 'Unauthorized', navItems: [] } })).status())
    }
    for (const path of ['/api/users/first-register', '/api/search/reindex']) {
      expect([401, 403]).toContain((await request.post(path, { data: { collections: ['pages'], email: 'anonymous@example.test', password: 'Not-an-editor-123!' } })).status())
    }
    expect([401, 403]).toContain((await request.get('/api/payload-jobs/run', { headers: { authorization: 'Bearer undefined' } })).status())
    for (const collection of ['users', 'form-submissions', 'payload-jobs']) {
      expect([401, 403]).toContain((await request.get(`/api/${collection}`)).status())
    }
  })
  test('GraphQL mutations and plugin form email settings are protected', async ({ request }) => {
    const response = await request.post('/api/graphql', { data: { query: 'mutation { createClient(data: {companyName: "Unauthorized", slug: "unauthorized"}) { id } }' } })
    const result = await response.json()
    expect(result.data?.createClient).toBeFalsy()
    expect(result.errors?.length).toBeGreaterThan(0)
    expect(JSON.stringify(result.errors)).toMatch(/not allowed|unauthoriz|forbidden/i)
    const forms = await (await request.get('/api/forms?depth=2')).json()
    for (const form of forms.docs) expect(form.emails).toBeUndefined()
    expect((await request.post('/api/ai-chat', { headers: { origin: 'https://attacker.example' }, data: { message: 'hello' } })).status()).toBe(403)
  })
})
