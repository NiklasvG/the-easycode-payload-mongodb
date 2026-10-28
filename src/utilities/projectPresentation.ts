export const projectTypeLabels = {
  'brand-webseite': 'Brand Webseite', individualsoftware: 'Individualsoftware',
  'e-commerce': 'E-Commerce', 'app-entwicklung': 'App-Entwicklung', hosting: 'Hosting',
} satisfies Record<string, string>

export function getProjectTypeLabel(value?: string | null): string | null {
  return value && value in projectTypeLabels ? projectTypeLabels[value as keyof typeof projectTypeLabels] : null
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric', timeZone: 'UTC' })
export function formatProjectDateRange(startDate?: string | null, endDate?: string | null): string | null {
  if (!startDate) return null
  const startDateValue = new Date(startDate)
  const endDateValue = endDate ? new Date(endDate) : null
  if (!Number.isFinite(startDateValue.getTime()) || (endDateValue && !Number.isFinite(endDateValue.getTime()))) return null
  const start = dateFormatter.format(startDateValue)
  const end = endDateValue ? dateFormatter.format(endDateValue) : 'laufend'
  return start === end ? start : `${start} - ${end}`
}
