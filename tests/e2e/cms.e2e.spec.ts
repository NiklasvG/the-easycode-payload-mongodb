import { test, expect } from '@playwright/test'

test.describe('CMS → public HTTP invalidation', () => {
  test.skip(process.env.TEST_DATABASE !== 'true', 'Only isolated seed allowed')
  test('publishes, renames, withdraws and deletes without serving drafts', async ({ request, page }) => {
    const login = await request.post('/api/users/login', { data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })
    expect(login.ok()).toBe(true)
    const { token } = await login.json()
    const headers = { Authorization: `JWT ${token}` }
    const mediaResponse = await request.get('/api/media?limit=1', { headers })
    const media = (await mediaResponse.json()).docs[0]
    expect(media?.id).toBeTruthy()
    const slug = `cache-test-${Date.now()}`
    const created = await request.post('/api/pages', { headers, data: { title: 'Cache lifecycle', slug, _status: 'published', hero: { type: 'textAnimation', title: 'Published first', description: 'HTTP regression', media: media.id }, layout: [{ blockType: 'content', columns: [] }] } })
    expect(created.ok(), await created.text()).toBe(true)
    const { doc } = await created.json()
    try {
      const first = await request.get(`/${slug}`)
      expect(first.ok()).toBe(true)
      expect(await first.text()).toContain('Published first')
      const updated = await request.patch(`/api/pages/${doc.id}`, { headers, data: { slug: `${slug}-new`, hero: { type: 'textAnimation', title: 'Published second', description: 'HTTP regression' } } })
      expect(updated.ok()).toBe(true)
      expect((await request.get(`/${slug}`)).status()).toBe(404)
      const next = await request.get(`/${slug}-new`)
      expect(await next.text()).toContain('Published second')
      const withdrawn = await request.patch(`/api/pages/${doc.id}`, { headers, data: { _status: 'draft', hero: { type: 'textAnimation', title: 'Private draft' } } })
      expect(withdrawn.ok()).toBe(true)
      const publicPage = await request.get(`/${slug}-new`)
      expect(publicPage.status()).toBe(404)
      expect(await publicPage.text()).not.toContain('Private draft')
      const previewURL = `/next/preview?collection=pages&slug=${slug}-new&path=/${slug}-new&previewSecret=${process.env.PREVIEW_SECRET}`
      const preview = await request.get(previewURL)
      expect(preview.ok()).toBe(true)
      expect(await preview.text()).toContain('Private draft')
      await request.get('/next/exit-preview')
      expect((await request.get(`/${slug}-new`)).status()).toBe(404)
      await page.request.post('/api/users/login', { data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })
      await page.goto(`/admin/collections/pages/${doc.id}`)
      await expect(page.locator('iframe').first()).toBeVisible()
      await expect(page.frameLocator('iframe').first().getByText('Private draft', { exact: true })).toBeVisible()
    } finally {
      expect((await request.delete(`/api/pages/${doc.id}`, { headers })).ok()).toBe(true)
    }
  })
  test('editor can log into the Admin UI', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill('editor@example.test')
    await page.getByLabel('Password', { exact: true }).fill('CI-editor-only-123!')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.getByRole('link', { name: 'Pages', exact: true }).first()).toBeVisible()
  })
  for (const collection of ['posts', 'projects'] as const) {
    test(`${collection} publication lifecycle and sitemap stay consistent`, async ({ request }) => {
      const { token } = await (await request.post('/api/users/login', { data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })).json()
      const headers = { Authorization: `JWT ${token}` }
      const slug = `${collection}-${Date.now()}`
      const projectSeed = (await (await request.get('/api/projects?limit=1', { headers })).json()).docs[0]
      const data = collection === 'posts'
        ? { title: 'Lifecycle post', slug, _status: 'published', content: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, format: '', indent: 0, direction: null, children: [{ type: 'text', version: 1, text: 'Published post body', format: 0, detail: 0, mode: 'normal', style: '' }] }], format: '', indent: 0, direction: null } } }
        : { title: 'Lifecycle project', slug, _status: 'published', client: projectSeed.client.id, image: projectSeed.image.id, shortDescription: 'HTTP lifecycle', projectType: 'brand-webseite', industry: 'IT', startDate: '2026-01-01', role: 'Test', outcomeSentence: 'Test' }
      const created = await request.post(`/api/${collection}`, { headers, data })
      expect(created.ok(), await created.text()).toBe(true)
      const { doc } = await created.json()
      const path = (value: string) => collection === 'posts' ? `/posts/${value}` : `/projekte/${projectSeed.client.slug}/${value}`
      const expectMissing = async (url: string) => {
        const response = await request.get(url)
        // A loading boundary may stream the HTTP 200 shell before notFound().
        expect([200, 404]).toContain(response.status())
        const html = await response.text()
        expect(html).toContain('noindex')
        expect(html).not.toContain('Changed lifecycle')
      }
      try {
        expect((await request.get(path(slug))).ok()).toBe(true)
        expect(await (await request.get('/sitemap.xml')).text()).toContain(path(slug))
        expect((await request.patch(`/api/${collection}/${doc.id}`, { headers, data: { slug: `${slug}-new`, title: 'Changed lifecycle' } })).ok()).toBe(true)
        await expectMissing(path(slug))
        expect(await (await request.get(path(`${slug}-new`))).text()).toContain('Changed lifecycle')
        expect((await request.patch(`/api/${collection}/${doc.id}`, { headers, data: { _status: 'draft' } })).ok()).toBe(true)
        await expectMissing(path(`${slug}-new`))
        expect(await (await request.get('/sitemap.xml')).text()).not.toContain(path(`${slug}-new`))
      } finally {
        expect((await request.delete(`/api/${collection}/${doc.id}`, { headers })).ok()).toBe(true)
      }
    })
  }
})



