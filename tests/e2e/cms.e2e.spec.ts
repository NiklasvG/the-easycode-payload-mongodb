import { test, expect } from '@playwright/test'

test.describe('CMS → public HTTP invalidation', () => {
  test.skip(process.env.TEST_DATABASE !== 'true', 'Only isolated seed allowed')
  test('publishes, renames, withdraws and deletes without serving drafts', async ({ request }) => {
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
})



