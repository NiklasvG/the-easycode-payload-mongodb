import { getPayload } from 'payload'
import config from '../src/payload.config'
import sharp from 'sharp'

const richText = (value: string) => ({
  root: {
    type: 'root', version: 1, format: '' as const, indent: 0, direction: null,
    children: [{
      type: 'paragraph', version: 1, format: '' as const, indent: 0, direction: null,
      children: [{ type: 'text', version: 1, text: value, format: 0, detail: 0, mode: 'normal', style: '' }],
    }],
  },
})

const uri = new URL(process.env.MONGODB_URI || '')
if (process.env.TEST_DATABASE !== 'true' || !['localhost', '127.0.0.1'].includes(uri.hostname) || uri.pathname !== '/easycode_test') {
  throw new Error('Seed requires TEST_DATABASE=true and local easycode_test database')
}
const payload = await getPayload({ config })
try {
  // Complete collection/index creation before opening the first write transaction.
  await Promise.all(Object.values(payload.db.collections).map((model) => model.init()))
  await Promise.all(Object.values(payload.db.versions).map((model) => model.init()))
  if ((await payload.count({ collection: 'pages' })).totalDocs > 0) throw new Error('Seed requires an empty test database')
  const context = { disableRevalidate: true }
  const image = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: '#43876b' } }).png().toBuffer()
  const media = await payload.create({ collection: 'media', context, data: { alt: 'Testprojekt Illustration' }, file: { data: image, mimetype: 'image/png', name: 'test-project.png', size: image.length } })
  const client = await payload.create({ collection: 'clients', context, data: {
    companyName: 'Testkunde', slug: 'testkunde',
    contacts: [
      { name: 'Testkontakt Eins', position: 'Projektleitung', comment: 'Die Zusammenarbeit war zuverlässig.', image: media.id },
      { name: 'Testkontakt Zwei', position: 'Entwicklung', comment: 'Das Projekt wurde erfolgreich umgesetzt.', image: media.id },
    ],
  } })
  await payload.create({ collection: 'users', data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })
  await payload.create({ collection: 'projects', context, data: { title: 'Testprojekt', slug: 'testprojekt', client: client.id, shortDescription: 'Reproduzierbares Projekt für automatisierte Tests', projectType: 'brand-webseite', industry: 'IT', startDate: '2026-01-01', role: 'Entwicklung', outcomeSentence: 'Zuverlässige Tests', image: media.id, _status: 'published' } })
  await payload.create({ collection: 'projects', context, data: { title: 'Testsoftware', slug: 'testsoftware', client: client.id, shortDescription: 'Zweiter Projekttyp für Filtertests', projectType: 'individualsoftware', industry: 'IT', startDate: '2025-12-01', role: 'Entwicklung', outcomeSentence: 'Gezielte Projektfilter', image: media.id, _status: 'published' } })
  for (const slug of ['home', 'projekte']) {
    await payload.create({ collection: 'pages', context, data: {
      title: slug === 'home' ? 'Webentwicklung Dresden' : 'Projekte', slug, _status: 'published',
      hero: { type: 'textAnimation', title: 'Dresden', description: 'Testseite', phrases: [{ phrase: 'Webentwicklung' }], media: media.id },
      layout: [
        { blockType: 'projectsGrid', backgroundVariant: 'primary', headline: 'Projekte', enableProjectTypeFilter: slug === 'projekte', link: { type: 'custom', url: '/projekte', label: 'Alle Projekte' } },
        ...(slug === 'home' ? [{ blockType: 'clientQuotes' as const, backgroundVariant: 'primary' as const, headline: 'Kundenstimmen', maxQuotes: 2 }] : []),
      ],
    } })
  }
  // SEO browser tests need published CMS content, including nested service routes.
  const services = await payload.create({ collection: 'pages', context, data: {
    title: 'Leistungen', slug: 'leistungen', _status: 'published',
    hero: { type: 'none' },
    layout: [{ blockType: 'content', columns: [{ size: 'full', richText: richText('Unsere Leistungen im Überblick.') }] }],
  } })
  for (const [slug, title] of [['web-entwicklung', 'Webentwicklung'], ['dev-ops', 'DevOps']]) {
    await payload.create({ collection: 'pages', context, data: {
      title, slug, parent: services.id, _status: 'published',
      hero: { type: 'none' },
      layout: [{
        blockType: 'faq', backgroundVariant: 'primary', headline: `Fragen zu ${title}`,
        items: [
          { question: 'Wie beginnt die Zusammenarbeit?', answer: richText('Wir besprechen Ziele und Anforderungen.') },
          { question: 'Wie wird das Projekt umgesetzt?', answer: richText('Wir setzen das Projekt in abgestimmten Schritten um.') },
        ],
      }],
    } })
  }
  await payload.create({ collection: 'pages', context, data: {
    title: 'Kontakt', slug: 'kontakt', _status: 'published',
    hero: { type: 'none' },
    layout: [{ blockType: 'contactIntro', headline: 'Lass uns etwas Großartiges bauen.' }],
  } })
  await payload.updateGlobal({ slug: 'header', context, data: { navItems: [{ link: { type: 'custom', url: '/projekte', label: 'Projekte' } }] } })
  await payload.create({ collection: 'redirects', context, data: { from: '/altes-projekt', to: { type: 'custom', url: '/projekte/testkunde/testprojekt' } } })
} finally {
  await payload.destroy()
}

