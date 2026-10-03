// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { Payload } from 'payload'

describe.skipIf(process.env.TEST_MAILPIT !== 'true')('isolated SMTP transport', () => {
  it('delivers through Payload to the local Mailpit inbox', async () => {
    const subject = `Payload test ${Date.now()}`
    const adapter = await nodemailerAdapter({
      defaultFromAddress: 'sender@example.test',
      defaultFromName: 'Test',
      transportOptions: { host: '127.0.0.1', port: 1026, secure: false },
      skipVerify: true,
    })
    const email = adapter({ payload: {} as Payload })
    await email.sendEmail({ to: 'inbox@example.test', subject, text: 'Controlled SMTP test' })
    const result = await fetch('http://127.0.0.1:8026/api/v1/messages').then((response) =>
      response.json(),
    )
    expect(
      result.messages.some((message: { Subject: string }) => message.Subject === subject),
    ).toBe(true)
  })
})
