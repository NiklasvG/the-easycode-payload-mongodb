import type { FullConfig } from '@playwright/test'
import { assertTestEnvironment } from '../../scripts/assert-test-environment.mjs'

export default function setup(config: FullConfig) {
  if (config.projects.some((project) => project.name === 'core')) assertTestEnvironment(process.env)
}
