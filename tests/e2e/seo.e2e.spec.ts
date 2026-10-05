import { expect, test } from '@playwright/test'

test.describe('SEO in the initial HTML', () => {
  test.use({ javaScriptEnabled: false })

  test('homepage metadata and structured data work without JavaScript', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    expect(title.match(/The-EasyCode/g)?.length).toBe(1)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical!).pathname).toBe('/')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
    const graphs = await page.locator('script[type="application/ld+json"]').allTextContents()
    const entities = graphs.flatMap(value => JSON.parse(value)['@graph'])
    expect(entities.map(entity => entity['@type'])).toEqual(expect.arrayContaining(['WebSite', 'Organization', 'WebPage']))
  })

  test('all service FAQ answers are present and can open without JavaScript', async ({ page }) => {
    for (const path of ['/leistungen/web-entwicklung', '/leistungen/dev-ops']) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response?.status()).toBe(200)
      expect(new URL(page.url()).pathname).toBe(path)
      const details = page.locator('article details')
      expect(await details.count()).toBeGreaterThan(1)
      await expect(details.locator('.payload-richtext')).toHaveCount(await details.count())
      await details.nth(1).locator('summary').click()
      await expect(details.nth(1)).toHaveAttribute('open', '')
      await expect(details.nth(1).locator('.payload-richtext')).toBeVisible()
    }
  })

  test('project schema agrees with its canonical and visible breadcrumbs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const href = await page.locator('article a[href^="/projekte/"]').first().getAttribute('href')
    expect(href).toBeTruthy()
    await page.goto(href!, { waitUntil: 'domcontentloaded' })
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    const entities = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap(value => JSON.parse(value)['@graph'])
    expect(entities).toContainEqual(expect.objectContaining({ '@type': 'CreativeWork', url: canonical }))
    const nav = page.getByRole('navigation', { name: 'Brotkrümelnavigation' })
    await expect(nav.getByRole('link', { name: 'Projekte', exact: true })).toHaveAttribute('href', '/projekte')
    await expect(nav.locator('[aria-current="page"]')).toHaveText(await page.locator('h1').innerText())
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(nav).toBeVisible()
    expect(await nav.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  })

  test('search is excluded and the public directory uses real CMS links', async ({ page, request }) => {
    await page.goto('/suche?q=web', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).not.toContain('/suche</loc>')
    const index = await request.get('/llms.txt')
    if (process.env.APP_ENV === 'staging') {
      expect(index.status()).toBe(404)
      return
    }
    expect(index.status()).toBe(200)
    expect(index.headers()['content-type']).toContain('text/plain')
    expect(await index.text()).toContain('## Projekte')
  })

  test('home alias redirects to the root', async ({ page }) => {
    await page.goto('/home', { waitUntil: 'domcontentloaded' })
    expect(new URL(page.url()).pathname).toBe('/')
  })

  test('contact retains its single CMS heading', async ({ page }) => {
    const response = await page.goto('/kontakt', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toHaveCount(1)
  })
})
