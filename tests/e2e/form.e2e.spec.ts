import { expect, test } from '@playwright/test'

test('visitor form submission reaches only the local SMTP inbox', async ({ page, request }) => {
  test.skip(process.env.TEST_DATABASE !== 'true' || process.env.TEST_MAILPIT !== 'true', 'Isolated MongoDB and Mailpit required')
  const { token } = await (await request.post('/api/users/login', { data: { email: 'editor@example.test', password: 'CI-editor-only-123!' } })).json()
  const headers = { Authorization: `JWT ${token}` }
  const subject = `Form regression ${Date.now()}`
  const text = (value: string) => ({ root: { type: 'root', version: 1, format: '', indent: 0, direction: null, children: [{ type: 'paragraph', version: 1, format: '', indent: 0, direction: null, children: [{ type: 'text', version: 1, text: value, format: 0, detail: 0, mode: 'normal', style: '' }] }] } })
  const formResponse = await request.post('/api/forms', { headers, data: {
    title: subject, fields: [{ blockType: 'text', name: 'name', label: 'Testname', required: true, defaultValue: 'Testbesucher' }],
    submitButtonLabel: 'Test absenden', confirmationType: 'message', confirmationMessage: text('Danke für den Test'),
    emails: [{ emailTo: 'inbox@example.test', emailFrom: 'sender@example.test', subject, message: text('Name: {{name}}') }],
  } })
  expect(formResponse.ok(), await formResponse.text()).toBe(true)
  const { doc: form } = await formResponse.json()
  let pageID: string | undefined
  try {
    const slug = `form-${Date.now()}`
    const response = await request.post('/api/pages', { headers, data: { title: subject, slug, _status: 'published', hero: { type: 'none' }, layout: [{ blockType: 'formBlock', form: form.id }] } })
    expect(response.ok(), await response.text()).toBe(true)
    pageID = (await response.json()).doc.id
    await page.goto(`/${slug}`)
    await expect(page.getByLabel('Testname')).toHaveValue('Testbesucher')
    const honeypot = page.locator('input[name="website"]')
    await expect(honeypot).toHaveAttribute('tabindex', '-1')
    await expect(honeypot.locator('..')).toHaveAttribute('aria-hidden', 'true')
    // Bot traffic must be rejected without saving a submission or sending mail.
    const trapped = await request.post('/api/form-submissions', { data: {
      form: form.id, website: 'https://spam.example.test',
      submissionData: [{ field: 'name', value: 'Bot' }],
    } })
    expect(trapped.status()).toBe(400)
    const saved = await request.get(`/api/form-submissions?where[form][equals]=${form.id}`, { headers })
    expect((await saved.json()).docs).toHaveLength(0)
    await page.getByRole('button', { name: 'Test absenden' }).click()
    await expect(page.getByText('Nachricht gesendet!')).toBeVisible()
    await expect.poll(async () => {
      const inbox = await request.get('http://127.0.0.1:8026/api/v1/messages')
      return (await inbox.json()).messages.some((message: { Subject: string }) => message.Subject === subject)
    }).toBe(true)
  } finally {
    const submissions = (await (await request.get(`/api/form-submissions?where[form][equals]=${form.id}`, { headers })).json()).docs
    for (const submission of submissions) await request.delete(`/api/form-submissions/${submission.id}`, { headers })
    if (pageID) await request.delete(`/api/pages/${pageID}`, { headers })
    await request.delete(`/api/forms/${form.id}`, { headers })
  }
})
