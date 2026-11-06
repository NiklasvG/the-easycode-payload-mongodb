// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { CHAT_CONSENT_VERSION, CHAT_CONSENT_NOTICE } from '@/constants/chatConsent'
import { recordChatConsent, CHAT_RECEIPT_COLLECTION } from '@/utilities/chatConsentReceipts'

const now = new Date('2026-11-06T21:00:00Z')
const consent = () => ({
  accepted: true as const,
  version: CHAT_CONSENT_VERSION,
  acceptedAt: now.getTime(),
  id: '11111111-1111-4111-8111-111111111111',
})
let createIndex: ReturnType<typeof vi.fn>
let updateOne: ReturnType<typeof vi.fn>
let payload: Pick<Payload, 'db'>
let collection: ReturnType<typeof vi.fn>

describe('private bounded chat consent receipts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    createIndex = vi.fn().mockResolvedValue('created')
    updateOne = vi.fn().mockResolvedValue({ acknowledged: true })
    collection = vi.fn(() => ({ createIndex, updateOne }))
    payload = { db: { connection: { collection } } } as unknown as Pick<Payload, 'db'>
  })
  afterEach(() => vi.useRealTimers())

  it('uses a private collection, unique identity and an automatic TTL expiry', async () => {
    await recordChatConsent(payload, consent())
    expect(collection).toHaveBeenCalledWith(CHAT_RECEIPT_COLLECTION)
    expect(createIndex).toHaveBeenCalledWith(
      { consentId: 1, version: 1 }, { name: 'consent_identity', unique: true },
    )
    expect(createIndex).toHaveBeenCalledWith(
      { expiresAt: 1 }, { name: 'consent_expiry', expireAfterSeconds: 0 },
    )
    expect(updateOne.mock.calls[0][1].$set.expiresAt.getTime() - now.getTime())
      .toBe(90 * 86400000)
    expect(updateOne.mock.calls[0][2]).toEqual({
      upsert: true, writeConcern: { w: 'majority', j: true }, maxTimeMS: 5000,
    })
  })

  it('stores only allowlisted metadata even when additional private fields arrive', async () => {
    await recordChatConsent(payload, { ...consent(), message: 'PRIVATE', ip: '192.0.2.1' } as never)
    const write = updateOne.mock.calls[0][1]
    expect(Object.keys(write.$setOnInsert).sort()).toEqual([
      'clientAcceptedAt', 'consentId', 'noticeHash', 'privacyVersion', 'recordedAt', 'version',
    ])
    expect(write.$setOnInsert.noticeHash).toMatch(/^[a-f0-9]{64}$/)
    expect(CHAT_CONSENT_NOTICE).toContain('30 Tage')
    expect(JSON.stringify(updateOne.mock.calls)).not.toContain('PRIVATE')
    expect(JSON.stringify(updateOne.mock.calls)).not.toContain('192.0.2.1')
  })

  it('upserts one consent identity without resetting its original server timestamp', async () => {
    await recordChatConsent(payload, consent())
    vi.setSystemTime(new Date(now.getTime() + 60000))
    await recordChatConsent(payload, consent())
    expect(createIndex).toHaveBeenCalledTimes(2)
    expect(updateOne.mock.calls[0][0]).toEqual(updateOne.mock.calls[1][0])
    expect(updateOne.mock.calls[1][1].$setOnInsert).toHaveProperty('recordedAt')
    expect(updateOne.mock.calls[1][1].$set).not.toHaveProperty('recordedAt')
  })

  it('rejects old notice versions and expired declarations before database access', async () => {
    await expect(recordChatConsent(payload, { ...consent(), version: 'openai-consent-v2' }))
      .rejects.toThrow('Invalid consent receipt')
    await expect(recordChatConsent(payload, { ...consent(), acceptedAt: now.getTime() - 86400000 }))
      .rejects.toThrow('Invalid consent receipt')
    expect(collection).not.toHaveBeenCalled()
  })

  it('does not store a receipt without expiry indexing and retries failed initialization', async () => {
    createIndex.mockRejectedValueOnce(new Error('index unavailable'))
    await expect(recordChatConsent(payload, consent())).rejects.toThrow('index unavailable')
    expect(updateOne).not.toHaveBeenCalled()
    await recordChatConsent(payload, consent())
    expect(updateOne).toHaveBeenCalledTimes(1)
  })

  it('propagates failed acknowledged writes to the caller', async () => {
    updateOne.mockRejectedValueOnce(new Error('write unavailable'))
    await expect(recordChatConsent(payload, consent())).rejects.toThrow('write unavailable')
  })
})
