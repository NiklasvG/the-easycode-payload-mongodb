import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NEXT_PUBLIC_SERVER_URL?.startsWith('https://') },
  },
  // Provision the first editor through the trusted CLI/Local API, never a public endpoint.
  endpoints: [{ path: '/first-register', method: 'post', handler: () => Response.json({ error: 'Public registration is disabled' }, { status: 403 }) }],
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
