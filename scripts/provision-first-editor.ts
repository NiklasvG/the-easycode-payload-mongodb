import { getPayload } from 'payload'
import config from '../src/payload.config'

const email = process.env.INITIAL_EDITOR_EMAIL
const password = process.env.INITIAL_EDITOR_PASSWORD
if (!email || !password || password.length < 16) throw new Error('Provide INITIAL_EDITOR_EMAIL and INITIAL_EDITOR_PASSWORD (at least 16 characters) through the local environment')
const payload = await getPayload({ config })
try {
  if ((await payload.count({ collection: 'users' })).totalDocs !== 0) throw new Error('First-editor provisioning requires an empty users collection')
  await payload.create({ collection: 'users', data: { email, password }, overrideAccess: true })
  console.info('Initial editor provisioned. Remove the initialization variables from the environment.')
} finally { await payload.destroy() }
