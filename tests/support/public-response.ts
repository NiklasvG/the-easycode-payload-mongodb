import { expect, type APIRequestContext } from '@playwright/test'

/** CMS responses can arrive before Next finishes flushing its pending cache invalidations. */
export async function expectPublicResponse(
  request: APIRequestContext,
  path: string,
  check: (body: string, status: number) => boolean,
) {
  await expect
    .poll(
      async () => {
        const response = await request.get(path)
        return check(await response.text(), response.status())
      },
      { message: `Published response at ${path}`, timeout: 5000, intervals: [50, 100, 250, 500] },
    )
    .toBe(true)
}
