/** Versioned visitor-facing wording; keep prior versions in Git for consent evidence. */
export const CHAT_CONSENT_VERSION = 'openai-consent-v3'
export const CHAT_PRIVACY_VERSION = '2026-11-06'
export const CHAT_CONSENT_SUMMARY =
  'Ich willige ein, dass The-EasyCode meine Nachrichten und den Gesprächsverlauf zur Beantwortung meiner Fragen an OpenAI Ireland Ltd. übermittelt. Die Verarbeitung kann außerhalb der EU erfolgen. OpenAI kann Eingaben und Antworten zur Missbrauchserkennung grundsätzlich bis zu 30 Tage speichern.'
export const CHAT_CONSENT_CHOICE = 'Die Einwilligung ist freiwillig und jederzeit im Chat widerrufbar.'
export const CHAT_CONSENT_WARNING =
  'Bitte keine sensiblen Daten oder Daten anderer Personen eingeben. KI-Antworten können Fehler enthalten.'
export const CHAT_CONSENT_NOTICE = [
  CHAT_CONSENT_SUMMARY,
  CHAT_CONSENT_CHOICE,
  CHAT_CONSENT_WARNING,
  'Weitere Informationen: /datenschutz#ki-chat',
].join('\n')
