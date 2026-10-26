'use client'

import Link from 'next/link'

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="de">
      <head>
        <title>Seite nicht verfügbar | The-EasyCode</title>
      </head>
      <body
        style={{
          margin: 0,
          background: '#090a0c',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.6,
        }}
      >
        <main
          style={{
            maxWidth: '44rem',
            margin: '10vh auto',
            padding: '2rem',
            overflowWrap: 'anywhere',
          }}
        >
          <p style={{ color: '#00adb2' }}>The-EasyCode</p>
          <h1>Die Website konnte nicht geladen werden</h1>
          <p>Bitte versuche es erneut oder kehre zur Startseite zurück.</p>
          <button
            type="button"
            onClick={retry}
            style={{
              padding: '.85rem 1.25rem',
              minHeight: 44,
              borderRadius: 24,
              border: '2px solid #008085',
              background: '#008085',
              color: '#ffffff',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            Erneut versuchen
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '.85rem 1.25rem',
              color: '#fafafa',
              textUnderlineOffset: 4,
            }}
          >
            Zur Startseite
          </Link>
        </main>
      </body>
    </html>
  )
}
