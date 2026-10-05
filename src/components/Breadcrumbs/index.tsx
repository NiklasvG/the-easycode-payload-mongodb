import Link from 'next/link'
import type { Breadcrumb } from '@/utilities/structuredData'

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  if (items.length < 2) return null
  return (
    <nav aria-label="Brotkrümelnavigation" className="container pt-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.path}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? <span aria-current="page">{item.name}</span>
              : <Link className="hover:underline" href={item.path}>{item.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
