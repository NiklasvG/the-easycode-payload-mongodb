import { getPayload } from 'payload'
import config from '../src/payload.config'
import sharp from 'sharp'

const uri = new URL(process.env.MONGODB_URI || '')
if (process.env.TEST_DATABASE !== 'true' || !['localhost', '127.0.0.1'].includes(uri.hostname) || uri.pathname !== '/easycode_test') {
  throw new Error('Seed requires TEST_DATABASE=true and local easycode_test database')
}
const payload = await getPayload({ config })
try {
  if ((await payload.count({ collection: 'pages' })).totalDocs > 0) throw new Error('Seed requires an empty test database')
  const context = { disableRevalidate: true }
  const image = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: '#43876b' } }).png().toBuffer()
  const media = await payload.create({ collection: 'media', context, data: { alt: 'Testprojekt Illustration' }, file: { data: image, mimetype: 'image/png', name: 'test-project.png', size: image.length } })
  const client = await payload.create({ collection: 'clients', context, data: { companyName: 'Testkunde', slug: 'testkunde' } })
  await payload.create({ collection: 'users', data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })
  await payload.create({ collection: 'projects', context, data: { title: 'Testprojekt', slug: 'testprojekt', client: client.id, shortDescription: 'Reproduzierbares Projekt für automatisierte Tests', projectType: 'brand-webseite', industry: 'IT', startDate: '2026-01-01', role: 'Entwicklung', outcomeSentence: 'Zuverlässige Tests', image: media.id, _status: 'published' } })
  for (const slug of ['home', 'projekte']) {
    await payload.create({ collection: 'pages', context, data: {
      title: slug === 'home' ? 'The-EasyCode Dresden' : 'Projekte', slug, _status: 'published',
      hero: { type: 'textAnimation', title: 'Dresden', description: 'Testseite', phrases: [{ phrase: 'Webentwicklung' }], media: media.id },
      layout: [{ blockType: 'projectsGrid', backgroundVariant: 'primary', headline: 'Projekte', link: { type: 'custom', url: '/projekte', label: 'Alle Projekte' } }],
    } })
  }
  await payload.updateGlobal({ slug: 'header', context, data: { navItems: [{ link: { type: 'custom', url: '/projekte', label: 'Projekte' } }] } })
  await payload.create({ collection: 'redirects', context, data: { from: '/altes-projekt', to: { type: 'custom', url: '/projekte/testkunde/testprojekt' } } })
} finally {
  await payload.destroy()
}

