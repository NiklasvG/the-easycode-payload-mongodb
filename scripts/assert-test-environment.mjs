export function assertTestEnvironment(env) {
  const uri = new URL(env.MONGODB_URI || 'mongodb://invalid')
  if (
    env.TEST_DATABASE !== 'true' ||
    env.TEST_MAILPIT !== 'true' ||
    !['localhost', '127.0.0.1'].includes(uri.hostname) ||
    uri.pathname !== '/easycode_test' ||
    env.SMTP_HOST !== '127.0.0.1' ||
    env.SMTP_PORT !== '1026' ||
    env.EMAIL_TRANSPORT !== '' ||
    env.AI_CHAT_ENABLED !== 'false' ||
    !env.PAYLOAD_SECRET ||
    !env.PREVIEW_SECRET
  ) {
    throw new Error(
      'Core tests require an isolated local easycode_test MongoDB, Mailpit on 127.0.0.1:1026, EMAIL_TRANSPORT empty, AI_CHAT_ENABLED=false and test secrets. See docs/testing.md.',
    )
  }
  const base = new URL(env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000')
  if (!['localhost', '127.0.0.1'].includes(base.hostname))
    throw new Error('Core tests may only write to a local test application.')
}
