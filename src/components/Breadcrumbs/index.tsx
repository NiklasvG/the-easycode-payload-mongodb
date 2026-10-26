import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Breadcrumb } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

export function Breadcrumbs({ items, className }: { items: Breadcrumb[]; className?: string }) {
  if (items.length < 2) return null
  return (
    <nav aria-label="Brotkrümelnavigation" className={cn('text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.path}-${index}`} className="flex min-w-0 max-w-full items-center gap-2">
            {index > 0 && (
              <ChevronRight className="size-3 shrink-0 opacity-60" aria-hidden="true" />
            )}
            {index === items.length - 1 ? (
              <span className="min-w-0 [overflow-wrap:anywhere]" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                className="inline-flex min-h-9 items-center hover:text-foreground hover:underline underline-offset-4"
                href={item.path}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
