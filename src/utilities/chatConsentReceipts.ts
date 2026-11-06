import { createHash } from 'node:crypto'
import type { Payload } from 'payload'
import {
  CHAT_CONSENT_NOTICE,
  CHAT_CONSENT_VERSION,
  CHAT_PRIVACY_VERSION,
} from '@/constants/chatConsent'
import { parseChatConsent, type ChatConsent } from './chatProtocol'

export const CHAT_RECEIPT_COLLECTION = 'ai_chat_consent_receipts'
export const CHAT_RECEIPT_RETENTION_DAYS = 90
const noticeHash = createHash('sha256').update(CHAT_CONSENT_NOTICE).digest('hex')
const ready = new WeakMap<object, Promise<void>>()

/** Internal collection: never registered as a public Payload collection or REST endpoint. */
export async function recordChatConsent(payload: Pick<Payload, 'db'>, input: ChatConsent) {
  const now = new Date()
  const consent = parseChatConsent(input, now.getTime())
  if (!consent) throw new Error('Invalid consent receipt')
  const connection = payload.db.connection
  const collection = connection.collection(CHAT_RECEIPT_COLLECTION)
  let indexes = ready.get(connection)
  if (!indexes) {
    indexes = (async () => {
      await collection.createIndex(
        { consentId: 1, version: 1 },
        { name: 'consent_identity', unique: true },
      )
      await collection.createIndex(
        { expiresAt: 1 },
        { name: 'consent_expiry', expireAfterSeconds: 0 },
      )
    })()
    ready.set(connection, indexes)
  }
  try {
    await indexes
  } catch (error) {
    ready.delete(connection)
    throw error
  }
  const result = await collection.updateOne(
    {
      consentId: consent.id,
      version: CHAT_CONSENT_VERSION,
      clientAcceptedAt: new Date(consent.acceptedAt),
    },
    {
      $setOnInsert: {
        consentId: consent.id,
        version: CHAT_CONSENT_VERSION,
        clientAcceptedAt: new Date(consent.acceptedAt),
        recordedAt: now,
        noticeHash,
        privacyVersion: CHAT_PRIVACY_VERSION,
      },
      $set: {
        lastUsedAt: now,
        expiresAt: new Date(now.getTime() + CHAT_RECEIPT_RETENTION_DAYS * 86400000),
      },
    },
    { upsert: true, writeConcern: { w: 'majority', j: true }, maxTimeMS: 5000 },
  )
  if (!result.acknowledged) throw new Error('Consent receipt write was not acknowledged')
}
