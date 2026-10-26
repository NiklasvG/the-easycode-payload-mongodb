import { expect, test } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import type { Page, Project, Post } from '../../src/payload-types'
import { getPagePath, getProjectPath } from '../../src/utilities/contentPaths'
import { resolveCMSLinkHref } from '../../src/utilities/resolveCMSLinkHref'

// Read-only: use the published local content, never create CMS entries or send messages.
test.describe('website quality across published content', () => {
  test.setTimeout(240000)
  test('built navigation and footer agree with current published CMS globals', async ({
    page,
    request,
  }) => {
    const header = await (await request.get('/api/globals/header?depth=1')).json()
    const footer = await (await request.get('/api/globals/footer?depth=1')).json()
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation', exact: true })
    for (const { link } of header.navItems) {
      const href = resolveCMSLinkHref(link)
      if (href)
        await expect(nav.getByRole('link', { name: link.label, exact: true })).toHaveAttribute(
          'href',
          href,
        )
    }
    const contentinfo = page.getByRole('contentinfo')
    if (footer.aboutText)
      await expect(contentinfo.getByText(footer.aboutText, { exact: true })).toBeVisible()
    for (const section of footer.sections || []) {
      await expect(
        contentinfo.getByRole('navigation', { name: `${section.label} – Fußbereich` }),
      ).toBeAttached()
    }
  })
  test('all published pages and projects work on desktop and narrow mobile', async ({
    page,
    request,
  }, testInfo) => {
    const paths = new Set<string>(['/', '/suche', '/suche?q=keine-treffer-xyz-9281'])
    const inventory: Record<string, number> = {}
    for (const collection of ['pages', 'projects', 'posts'] as const) {
      const response = await request.get(`/api/${collection}?limit=100&depth=1`)
      expect(response.ok()).toBe(true)
      const result = await response.json()
      expect(
        result.hasNextPage,
        'Increase inventory pagination if the content exceeds 100 records',
      ).toBe(false)
      inventory[collection] = result.docs.length
      for (const doc of result.docs as (Page | Project | Post)[]) {
        if (collection === 'pages') {
          const cmsPage = doc as Page
          const path = getPagePath(cmsPage)
          paths.add(path)
          if (cmsPage.hero?.media) {
            expect
              .soft(typeof cmsPage.hero.media, `${path} hero media must resolve to a CMS record`)
              .toBe('object')
          }
        }
        if (collection === 'projects') {
          const path = getProjectPath(doc as Project)
          if (path) paths.add(path)
        }
        if (collection === 'posts') paths.add(`/posts/${encodeURIComponent(doc.slug!)}`)
      }
    }
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const visited: { path: string; width: number; heading: string }[] = []
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const path of paths) {
        const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
        expect.soft(response?.status(), `${path} at ${width}px`).toBe(200)
        await expect(page.locator('main h1').first(), path).toBeVisible()
        expect.soft(await page.locator('main h1').count(), `${path} h1 count`).toBe(1)
        expect
          .soft(
            await page.locator('a button, button a, a a').count(),
            `${path} nested interactive elements`,
          )
          .toBe(0)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        )
        expect.soft(overflow, `${path} horizontal overflow at ${width}px`).toBe(false)
        visited.push({ path, width, heading: await page.locator('main h1').innerText() })
      }
    }
    expect(errors).toEqual([])
    const coveragePath = testInfo.outputPath('coverage.json')
    await writeFile(coveragePath, JSON.stringify({ inventory, visited }, null, 2))
    await testInfo.attach('coverage.json', { path: coveragePath, contentType: 'application/json' })
  })

  test('mobile navigation traps focus, closes with Escape and follows real nested destinations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
    if (await decline.isVisible()) await decline.click()
    const trigger = page.getByRole('button', { name: 'Menü öffnen' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Navigation', exact: true })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('button', { name: 'Menü schließen' })).toBeFocused()
    for (let index = 0; index < 14; index++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(
        true,
      )
    }
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press('Shift+Tab')
      expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(
        true,
      )
    }
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
    await trigger.click()
    await dialog.getByRole('link', { name: 'Suche', exact: true }).click()
    await expect(page).toHaveURL(/\/suche$/)
    await expect(page.getByRole('button', { name: 'Menü öffnen' })).toBeVisible()
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
    await page.getByRole('button', { name: 'Menü öffnen' }).click()
    await page.setViewportSize({ width: 1024, height: 768 })
    await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).not.toBeVisible()
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  })

  test('responsive representative screens, skip link, search submit and German 404', async ({
    page,
  }, testInfo) => {
    for (const width of [390, 768, 1024, 1920]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const path of ['/', '/kontakt', '/leistungen/web-entwicklung', '/projekte']) {
        await page.goto(path)
        expect
          .soft(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${path} at ${width}`,
          )
          .toBe(true)
      }
    }
    await page.goto('/suche')
    const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
    if (await decline.isVisible()) await decline.click()
    await page.getByRole('textbox', { name: 'Website durchsuchen' }).fill('R&D ?')
    await page.getByRole('button', { name: 'Suchen', exact: true }).click()
    await expect(page).toHaveURL(/q=R%26D\+%3F/)
    await expect(page.getByRole('heading', { name: 'Keine Ergebnisse gefunden' })).toBeVisible()
    await page.goto('/diese-seite-existiert-nicht-audit')
    await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible()
    await page.getByRole('link', { name: 'Zum Inhalt springen' }).focus()
    await expect(page.getByRole('link', { name: 'Zum Inhalt springen' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
    await testInfo.attach('404.png', { body: await page.screenshot(), contentType: 'image/png' })
  })

  test('large text reflows and cookie settings remain reachable on short mobile screens', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    for (const path of ['/', '/kontakt', '/suche', '/projekte']) {
      await page.goto(path)
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%'
      })
      expect
        .soft(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${path} at 200% text`,
        )
        .toBe(true)
    }
    const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
    await decline.scrollIntoViewIfNeeded()
    await decline.click()
    await page.getByRole('link', { name: 'Cookies', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Cookie-Einstellungen' })).toBeFocused()
    const save = page.getByRole('button', { name: 'Auswahl bestätigen', exact: true })
    await save.scrollIntoViewIfNeeded()
    await save.click()
    await expect(page.getByRole('link', { name: 'Cookies', exact: true })).toBeFocused()
  })

  test('technical public routes and the CMS login remain reachable without writes', async ({
    page,
    request,
  }) => {
    for (const path of [
      '/robots.txt',
      '/sitemap.xml',
      '/pages-sitemap.xml',
      '/posts-sitemap.xml',
      '/projects-sitemap.xml',
      '/api/ai-chat',
    ]) {
      expect.soft((await request.get(path)).status(), path).toBe(200)
    }
    const llms = await request.get('/llms.txt')
    expect(llms.status()).toBe(process.env.APP_ENV === 'staging' ? 404 : 200)
    expect([400, 401, 403]).toContain((await request.get('/next/preview')).status())
    await page.goto('/admin/login')
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible()
  })

  test('contact form validates, retains input on failure and confirms a mocked successful retry', async ({
    page,
  }) => {
    let attempts = 0
    await page.route('**/api/form-submissions', async (route) => {
      attempts++
      await route.fulfill(
        attempts === 1
          ? { status: 503, contentType: 'text/plain', body: 'Local test service unavailable' }
          : { status: 200, json: { doc: { id: 'local-browser-test-only' } } },
      )
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/kontakt')
    await page.getByRole('button', { name: 'Alle ablehnen', exact: true }).click()
    const form = page.locator('main form')
    const name = form.getByRole('textbox', { name: /^Name/ })
    await name.fill('Lokaler Browser-Test 👩🏽‍💻')
    await form.getByRole('textbox', { name: /^E-Mail/ }).fill('invalid')
    await form.getByRole('textbox', { name: /^Betreff/ }).fill('Test ohne Übermittlung')
    await form
      .getByRole('textbox', { name: /^Nachricht/ })
      .fill('Diese Testdaten verlassen den abgefangenen Browserrequest nicht.')
    await form.getByRole('checkbox').check()
    await form.getByRole('button', { name: /senden/i }).click()
    await expect(form.getByRole('textbox', { name: /^E-Mail/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(attempts).toBe(0)
    await form.getByRole('textbox', { name: /^E-Mail/ }).fill('local-visitor@example.test')
    await form.getByRole('button', { name: /senden/i }).click()
    const error = page.getByRole('alert').filter({ hasText: /fehlgeschlagen|versuche/i })
    await expect(error).toBeVisible()
    await expect(error).toBeFocused()
    await expect(name).toHaveValue('Lokaler Browser-Test 👩🏽‍💻')
    await form.getByRole('button', { name: /senden/i }).click()
    await expect(page.getByRole('heading', { name: 'Nachricht gesendet!' })).toBeVisible()
    expect(attempts).toBe(2)
  })
})
