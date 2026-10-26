'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <section className="container py-20 lg:py-28" aria-labelledby="page-error-title">
      <p className="overhead mb-4">Vorübergehend nicht verfügbar</p>
      <h1 id="page-error-title" className="mb-6">
        Die Seite konnte nicht geladen werden
      </h1>
      <p className="max-w-xl mb-8">
        Bitte versuche es noch einmal. Über die Startseite erreichst du weitere Inhalte.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button type="button" onClick={retry}>
          Erneut versuchen
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Zur Startseite</Link>
        </Button>
      </div>
    </section>
  )
}
