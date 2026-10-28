import { expect, test } from '@playwright/test'

type Node = {
  type: string
  text?: string
  tag?: string
  children?: Node[]
  fields?: { url?: string; newTab?: boolean }
}
const textContent = (node: Node): string =>
  node.text || node.children?.map(textContent).join('') || ''
const flatten = (nodes: Node[]): Node[] =>
  nodes.flatMap((node) => [node, ...flatten(node.children || [])])

test('credits preserves the current CMS headings, attribution links and target behavior', async ({
  page,
  request,
}) => {
  const response = await request.get('/api/pages?where[slug][equals]=credits&depth=1')
  expect(response.ok()).toBe(true)
  const { docs } = await response.json()
  const cms = docs[0]
  expect(cms).toBeTruthy()
  const nodes: Node[] = cms.layout.flatMap(
    (block: { columns?: { richText?: { root: { children: Node[] } } }[] }) =>
      block.columns?.flatMap((column) => flatten(column.richText?.root.children || [])) || [],
  )
  expect((await page.goto('/credits'))?.status()).toBe(200)
  for (const node of nodes) {
    if (node.type === 'heading' && node.tag === 'h2')
      await expect(
        page.getByRole('heading', { name: textContent(node), exact: true }),
      ).toBeVisible()
    if (node.type === 'link' && node.fields?.url) {
      const link = page
        .getByRole('main')
        .getByRole('link', { name: textContent(node), exact: true })
      await expect(link).toHaveAttribute('href', node.fields.url)
      expect(await link.getAttribute('target')).toBe(node.fields.newTab ? '_blank' : null)
      if (node.fields.newTab) await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  }
  expect(await page.locator('main h1').count()).toBe(1)
  expect(await page.locator('a button, button a, a a').count()).toBe(0)
})

test('credits reflows on mobile and desktop, including enlarged text', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    for (const largeText of [false, true]) {
      await page.goto('/credits')
      const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
      if (await decline.isVisible()) await decline.click()
      if (largeText)
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '200%'
        })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${width}px, 200%=${largeText}`,
      ).toBe(true)
      for (const link of await page.getByRole('main').getByRole('link').all()) {
        const box = await link.boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(44)
      }
      // Screenshots are evidence, not pixel snapshots tied to one CMS revision.
      if (!largeText && [390, 1440].includes(width))
        await page.screenshot({
          path: testInfo.outputPath(`credits-${width}.png`),
          fullPage: width === 390,
        })
    }
  }
  expect(errors).toEqual([])
})

test('credits is present without JavaScript and is reachable by keyboard', async ({
  browser,
  baseURL,
  page,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  try {
    const noJS = await context.newPage()
    expect((await noJS.goto('/credits'))?.status()).toBe(200)
    await expect(noJS.getByRole('heading', { level: 1, name: 'Credits' })).toBeVisible()
    await expect(
      noJS
        .getByRole('main')
        .getByRole('link', { name: 'Animated icons by Lordicon.com', exact: true }),
    ).toBeVisible()
    await expect(
      noJS.getByRole('main').getByRole('link', { name: 'Designed by Freepik', exact: true }),
    ).toBeVisible()
  } finally {
    await context.close()
  }
  await page.goto('/credits')
  const decline = page.getByRole('button', { name: 'Alle ablehnen', exact: true })
  if (await decline.isVisible()) await decline.click()
  await page.getByRole('link', { name: 'Zum Inhalt springen' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('main').getByRole('link').first()).toBeFocused()
  expect(
    await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle),
  ).not.toBe('none')
})
