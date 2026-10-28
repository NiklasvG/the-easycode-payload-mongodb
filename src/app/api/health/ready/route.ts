import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }
  try {
    const payload = await getPayload({ config })
    const database = payload.db.connection.db
    if (!database || payload.db.connection.readyState !== 1) throw new Error('Not connected')
    await database.admin().command({ ping: 1 }, { timeoutMS: 3000 })
    const revision = process.env.SOURCE_COMMIT
    return Response.json(
      {
        status: 'ready',
        ...(/^[a-f0-9]{40}$/.test(revision || '') ? { revision } : {}),
      },
      { headers },
    )
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503, headers })
  }
}
