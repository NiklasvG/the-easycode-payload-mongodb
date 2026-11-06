/** Stable public anchors, independent of section numbers and editorial heading changes. */
export const PRIVACY_SECTIONS = [
  { id: 'verantwortlicher', title: 'Verantwortlicher' },
  { id: 'hosting', title: 'Hosting und technische Bereitstellung' },
  { id: 'inhaltsverwaltung', title: 'Inhaltsverwaltung und Administrationsbereich' },
  { id: 'cookies', title: 'Cookies und lokale Browserspeicherung' },
  { id: 'nutzungsanalyse', title: 'Nutzungs- und Performance-Analyse mit Umami' },
  { id: 'kontakt', title: 'Kontaktformular und E-Mail' },
  { id: 'ki-chat', title: 'KI-Chat „EasyCode AI“' },
  { id: 'schriftarten', title: 'Schriftarten und externe Links' },
  { id: 'sicherungskopien', title: 'Sicherungskopien und weitere Empfänger' },
  { id: 'rechte', title: 'Ihre Rechte und Widerruf' },
  { id: 'beschwerderecht', title: 'Beschwerderecht' },
  { id: 'verschluesselung', title: 'Verschlüsselte Übertragung' },
] as const

export function privacySectionId(text: string): string | undefined {
  const title = text.replace(/^\d+\.\s*/, '').trim()
  return PRIVACY_SECTIONS.find((section) => section.title === title)?.id
}
