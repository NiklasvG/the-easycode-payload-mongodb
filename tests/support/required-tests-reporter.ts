import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter'

export default class RequiredTestsReporter implements Reporter {
  private skipped = false
  onTestEnd(test: TestCase, result: TestResult) {
    if (test.parent.project()?.name === 'core' && result.status === 'skipped') {
      this.skipped = true
      console.error(`Required test skipped: ${test.titlePath().join(' > ')}`)
    }
  }
  async onEnd(result: FullResult) {
    return { status: this.skipped ? ('failed' as const) : result.status }
  }
}
