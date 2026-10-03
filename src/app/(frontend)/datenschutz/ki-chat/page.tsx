import type { Metadata } from 'next'
import Link from 'next/link'
import { CHAT_PRIVACY_SECTIONS } from '@/constants/chatPrivacy'

export const metadata: Metadata = {
  title: 'Datenschutz im KI-Chat | The-EasyCode',
  description:
    'Informationen zu Datenverarbeitung, Einwilligung, Speicherung und Widerruf im EasyCode AI Chat.',
}

export default function ChatPrivacyPage() {
  return (
    <article className="container relative z-10 mx-auto max-w-3xl px-5 pb-20 pt-32 md:pt-40">
      <Link href="/datenschutz" className="text-sm text-accent underline underline-offset-4">
        Zur allgemeinen Datenschutzerklärung
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold md:text-5xl">Datenschutz im KI-Chat</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Stand: 4. Oktober 2026 · Aktueller Staging-Betrieb
      </p>
      <p className="mt-6 leading-relaxed">
        Hier findest du die ergänzenden Datenschutzinformationen zum freiwilligen EasyCode AI Chat.
        Du kannst diese Informationen vor deiner Entscheidung lesen. Das Öffnen dieser Seite erteilt
        keine Einwilligung.
      </p>
      <div className="mt-10 space-y-10">
        {CHAT_PRIVACY_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold md:text-2xl">{section.title}</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
        <section>
          <h2 className="text-xl font-semibold md:text-2xl">Weiterführende Informationen</h2>
          <ul className="mt-4 space-y-3 text-accent underline underline-offset-4">
            <li>
              <a
                href="https://developers.openai.com/api/docs/guides/your-data"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI: Datenkontrollen und Speicherregeln
              </a>
            </li>
            <li>
              <a
                href="https://openai.com/policies/data-processing-addendum/"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI: Auftragsverarbeitung und Übermittlungsgarantien
              </a>
            </li>
            <li>
              <a
                href="https://openai.com/policies/sub-processor-list/"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI: Unterauftragnehmer
              </a>
            </li>
            <li>
              <Link href="/kontakt">Kontaktformular als Alternative zum KI-Chat</Link>
            </li>
          </ul>
        </section>
      </div>
    </article>
  )
}
