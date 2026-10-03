import { expect, test } from '@playwright/test'

test.describe('CMS relationship and global invalidation', () => {
  test.skip(process.env.TEST_DATABASE !== 'true', 'Requires isolated seed')
  test('client rename updates project URL, search and sitemap; media changes reach consumers', async ({ request }) => {
    const { token } = await (await request.post('/api/users/login', { data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })).json()
    const headers = { Authorization: `JWT ${token}` }
    const project = (await (await request.get('/api/projects?limit=1', { headers })).json()).docs[0]
    const client = project.client
    const image = project.image
    const slug = `${client.slug}-changed`
    try {
      await request.get(`/projekte/${client.slug}/${project.slug}`)
      await request.get('/sitemap.xml')
      expect((await request.patch(`/api/clients/${client.id}`, { headers, data: { slug, companyName: 'Changed HTTP client' } })).ok()).toBe(true)
      const detail = await request.get(`/projekte/${slug}/${project.slug}`)
      expect(detail.ok()).toBe(true)
      expect(await detail.text()).toContain('Changed HTTP client')
      const search = await (await request.get(`/api/search?where[doc.value][equals]=${project.id}&depth=0`)).json()
      expect(search.docs[0].clientSlug).toBe(slug)
      const xml = await (await request.get('/sitemap.xml')).text()
      expect(xml).toContain(`/projekte/${slug}/${project.slug}`)
      expect(xml).not.toContain(`/projekte/${client.slug}/${project.slug}`)
      expect((await request.patch(`/api/media/${image.id}`, { headers, data: { alt: 'Updated HTTP image alt' } })).ok()).toBe(true)
      expect(await (await request.get('/projekte')).text()).toContain('Updated HTTP image alt')
    } finally {
      await request.patch(`/api/clients/${client.id}`, { headers, data: { slug: client.slug, companyName: client.companyName } })
      await request.patch(`/api/media/${image.id}`, { headers, data: { alt: image.alt } })
    }
  })
  test('nested parent rename, globals and redirects are visible on the next request', async ({ request, page }) => {
    const { token } = await (await request.post('/api/users/login', { data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })).json()
    const headers = { Authorization: `JWT ${token}` }
    const prefix = `nested-${Date.now()}`
    const oldHeader = await (await request.get('/api/globals/header', { headers })).json()
    const oldFooter = await (await request.get('/api/globals/footer', { headers })).json()
    const data = { _status: 'published', hero: { type: 'none' }, layout: [{ blockType: 'content', columns: [] }] }
    const parentResponse = await request.post('/api/pages', { headers, data: { ...data, title: 'Nested parent', slug: prefix } })
    expect(parentResponse.ok(), await parentResponse.text()).toBe(true)
    const { doc: parent } = await parentResponse.json()
    let childID: string | undefined
    let redirectID: string | undefined
    try {
      const childResponse = await request.post('/api/pages', { headers, data: { ...data, title: 'Nested child', slug: `${prefix}-child`, parent: parent.id } })
      expect(childResponse.ok(), await childResponse.text()).toBe(true)
      const { doc: child } = await childResponse.json()
      childID = child.id
      const childPath = `/${prefix}/${child.slug}`
      expect((await request.get(childPath)).ok()).toBe(true)
      expect((await request.patch(`/api/pages/${parent.id}`, { headers, data: { slug: `${prefix}-new` } })).ok()).toBe(true)
      const nextPath = `/${prefix}-new/${child.slug}`
      const changed = await request.get(nextPath)
      expect(changed.ok()).toBe(true)
      expect(await changed.text()).toContain(`http://localhost:3000${nextPath}`)
      const xml = await (await request.get('/sitemap.xml')).text()
      expect(xml).toContain(nextPath)
      expect(xml).not.toContain(childPath)
      expect((await request.post('/api/globals/header', { headers, data: { navItems: [{ link: { type: 'custom', url: '/projekte', label: 'Changed HTTP nav' } }] } })).ok()).toBe(true)
      expect((await request.post('/api/globals/footer', { headers, data: { aboutText: 'Changed HTTP footer' } })).ok()).toBe(true)
      const home = await (await request.get('/')).text()
      expect(home).toContain('Changed HTTP nav')
      expect(home).toContain('Changed HTTP footer')
      const redirectResponse = await request.post('/api/redirects', { headers, data: { from: `/${prefix}-redirect`, to: { type: 'custom', url: '/projekte' } } })
      expect(redirectResponse.ok(), await redirectResponse.text()).toBe(true)
      redirectID = (await redirectResponse.json()).doc.id
      await page.goto(`/${prefix}-redirect`)
      await expect(page).toHaveURL('http://localhost:3000/projekte')
      await request.patch(`/api/redirects/${redirectID}`, { headers, data: { to: { type: 'custom', url: nextPath } } })
      await page.goto(`/${prefix}-redirect`)
      await expect(page).toHaveURL(`http://localhost:3000${nextPath}`)
    } finally {
      if (redirectID) await request.delete(`/api/redirects/${redirectID}`, { headers })
      if (childID) await request.delete(`/api/pages/${childID}`, { headers })
      await request.delete(`/api/pages/${parent.id}`, { headers })
      await request.post('/api/globals/header', { headers, data: { navItems: oldHeader.navItems } })
      await request.post('/api/globals/footer', { headers, data: { aboutText: oldFooter.aboutText || '' } })
    }
  })
})
