import type { Page, Project } from '@/payload-types'

export function getPagePath(page: Partial<Pick<Page, 'slug' | 'breadcrumbs'>>): string {
  if (page.slug === 'home') return '/'
  const path = page.breadcrumbs?.at(-1)?.url
  return path?.startsWith('/') && !path.startsWith('//') ? path : `/${encodeURIComponent(page.slug || '')}`
}

export function getProjectPath(project: Partial<Pick<Project, 'slug' | 'client'>>): string | null {
  const client = project.client
  return client && typeof client === 'object' && client.slug && project.slug
    ? `/projekte/${encodeURIComponent(client.slug)}/${encodeURIComponent(project.slug)}` : null
}
