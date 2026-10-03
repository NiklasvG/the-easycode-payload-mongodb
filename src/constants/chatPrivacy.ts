// Update the consent version if the meaning or processing conditions change.
export const CHAT_PRIVACY_PATH = '/datenschutz/ki-chat'
export const CHAT_CONSENT_SUMMARY =
  'Ich willige ein, dass Niklas von Grzymala – The-EasyCode meine Nachrichten und den begrenzten Verlauf an OpenAI Ireland Ltd. übermittelt, um Fragen zu Leistungen, Projekten und Kontakt zu beantworten. Daten können außerhalb der EU verarbeitet und bei OpenAI gespeichert werden.'
export const CHAT_CONSENT_CHOICE =
  'Freiwillig, höchstens 24 Stunden pro Tab und jederzeit im Chat widerrufbar. Ohne Einwilligung bleibt das Kontaktformular verfügbar.'
export const CHAT_CONSENT_WARNING =
  'Bitte keine sensiblen oder fremden personenbezogenen Daten eingeben. KI-Antworten können Fehler enthalten.'

export const CHAT_PRIVACY_SECTIONS = [
  {
    title: 'Verantwortlicher und Kontakt',
    paragraphs: [
      'Verantwortlich ist Niklas von Grzymala – The-EasyCode, Rehefelder Str. 64, 01127 Dresden, Deutschland. Für Datenschutzanfragen: info@the-easycode.eu.',
    ],
  },
  {
    title: 'Zweck, Daten und Empfänger',
    paragraphs: [
      'Der freiwillige KI-Chat beantwortet Fragen zu Leistungen, öffentlichen Projekten und Kontaktmöglichkeiten. Erst wenn du einwilligst und eine Nachricht absendest, übermittelt der Website-Server deine Nachricht, einen begrenzten Gesprächsverlauf und ausgewählte öffentliche Portfolio-Inhalte an die OpenAI Responses API. Antworten können Fehler enthalten und sind keine verbindlichen Angebote oder Zusagen.',
      'Die Inhaltsverarbeitung erfolgt auf Grundlage deiner Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Die übrige Website und das Kontaktformular bleiben ohne KI-Chat verfügbar. Bitte gib keine Gesundheitsdaten, Zugangsdaten, vertraulichen Informationen oder personenbezogenen Daten anderer Personen ein. Deine Einwilligung erlaubt keine beliebige Verarbeitung solcher Angaben.',
      'Die Nachricht ist auf 1.000 Zeichen begrenzt. Als Gesprächskontext werden höchstens zwölf Nachrichten mit insgesamt 6.000 Zeichen übermittelt. Es werden keine Dateien hochgeladen und keine Chat-Inhalte aus dem CMS oder aus Kontaktanfragen gelesen. Besucher-IP, Browser-Header und Einwilligungsbestätigung werden nicht an OpenAI übermittelt.',
      'Die Website-Infrastruktur wird bei Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, auf einem Server in Falkenstein, Deutschland, betrieben. Vertragspartner für die OpenAI-Auftragsverarbeitung ist OpenAI Ireland Ltd., 1st Floor, The Liffey Trust Centre, 117–126 Sheriff Street Upper, Dublin 1, D01 YC43, Irland. Ein personalisierter Auftragsverarbeitungsvertrag liegt vor. OpenAI setzt vertraglich geregelte Unterauftragnehmer ein.',
    ],
  },
  {
    title: 'Verarbeitung außerhalb der EU',
    paragraphs: [
      'Der aktuelle Staging-Test verwendet den globalen OpenAI-Endpunkt. Eine ausschließliche Verarbeitung in der EU wird dafür nicht zugesagt. Der OpenAI-Auftragsverarbeitungsvertrag sieht für Übermittlungen von EWR-Daten an Empfänger außerhalb des EWR beziehungsweise der Schweiz Standardvertragsklauseln oder einen Angemessenheitsbeschluss der Europäischen Kommission vor. Informationen zu den anwendbaren Garantien kannst du über die oben genannte Kontaktadresse anfragen.',
      'Die Einwilligung in den Chat ersetzt keine erforderlichen Übermittlungsgarantien. Sie wird nicht als besondere Einwilligung in einen ansonsten unzulässigen Drittlandtransfer nach Art. 49 DSGVO verwendet.',
    ],
  },
  {
    title: 'Speicherung bei OpenAI',
    paragraphs: [
      'OpenAI verwendet API-Inhalte standardmäßig nicht zum Modelltraining. Die freiwillige Datenfreigabe ist deaktiviert. Die Anwendung setzt store=false und fordert keinen als Antwortzustand abrufbaren Gesprächsverlauf beim Anbieter an.',
      'Trotzdem können Eingaben und Antworten in Missbrauchsprotokollen grundsätzlich bis zu 30 Tage gespeichert werden. Eine längere Aufbewahrung ist möglich, wenn sie gesetzlich erforderlich oder zum Schutz des Dienstes oder Dritter vor Schäden angemessen notwendig ist. Prompt-Caching kann verschlüsselte Zwischenzustände der Modellverarbeitung auf GPU-Systemen für bis zu 24 Stunden vorhalten.',
      'Eine besondere Freigabe für Zero Data Retention oder Modified Abuse Monitoring liegt derzeit nicht vor. store=false und deaktiviertes Dashboard-Logging verhindern diese Speicherwege nicht insgesamt.',
    ],
  },
  {
    title: 'Lokaler Verlauf, Einwilligungsnachweis und Missbrauchsschutz',
    paragraphs: [
      'Der Gesprächsverlauf liegt ausschließlich im Arbeitsspeicher der geöffneten Website, nicht im Local Storage oder Session Storage. Neuladen oder Verlauf löschen entfernt ihn. Schließen des Chatfensters bricht eine laufende Anfrage ab, behält den Verlauf aber im selben Dokument.',
      'Deine Einwilligung wird mit Version, Zeitpunkt und einer zufälligen Bestätigungs-ID im Session Storage des Browser-Tabs gespeichert. Sie gilt höchstens 24 Stunden. Bei erkanntem Ablauf oder Widerruf werden die Bestätigung und der lokale Verlauf entfernt. Browser können Tab-Sitzungen wiederherstellen oder beim Duplizieren übernehmen; die zeitliche Gültigkeitsprüfung bleibt bestehen.',
      'Zum erforderlichen Nachweis nach Art. 7 Abs. 1 DSGVO protokolliert der Server bei zulässigen Anfragen nur die bereinigte Einwilligungsbestätigung: Version, vom Browser angegebener Bestätigungszeitpunkt, zufällige ID und aktive Zustimmung. Der Eintrag enthält keine Chat-Inhalte oder IP-Adresse. Rechtsgrundlage der erforderlichen Nachweisdokumentation ist Art. 6 Abs. 1 lit. c in Verbindung mit Art. 7 Abs. 1 DSGVO.',
      'Für Anwendung und Proxy sind jeweils drei Docker-Protokolldateien mit einer konfigurierten Größe von jeweils 10 MB eingerichtet. Ältere Dateien werden bei der Rotation entfernt. Es besteht keine feste Löschfrist in Tagen; die Aufbewahrung hängt von der Menge anfallender Protokolldaten ab. Der Einwilligungsnachweis liegt in diesen Anwendungsprotokollen.',
      'Zur Begrenzung missbräuchlicher Anfragen verarbeitet der Server die vom vertrauenswürdigen Proxy übermittelte IP-Adresse und daraus abgeleitete pseudonymisierte Zähler. Die Zähler enthalten keine Klartext-IP, verfallen nach einer Minute und werden regelmäßig alle 15 Sekunden bereinigt. Verzögerte Programmausführung kann die Bereinigung verzögern. Zufallsschlüssel und Zähler werden bei Prozessende verworfen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO mit dem Interesse an sicherer und zuverlässiger Bereitstellung.',
    ],
  },
  {
    title: 'Widerruf und deine Rechte',
    paragraphs: [
      'Du kannst jederzeit über „Einwilligung widerrufen“ im Chat deine Zustimmung für die Zukunft zurücknehmen. Der lokale Verlauf und die Bestätigung werden gelöscht, eine laufende Anfrage wird abgebrochen und neue Nachrichten setzen eine erneute Einwilligung voraus. Die Rechtmäßigkeit bereits erfolgter Verarbeitung bleibt unberührt. Ein sofortiger Abbruch oder eine sofortige Löschung bereits übermittelter Daten bei OpenAI ist damit nicht garantiert.',
      'Du hast im gesetzlichen Umfang Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit sowie ein Widerspruchsrecht bei Verarbeitung aufgrund berechtigter Interessen. Wende dich dafür an info@the-easycode.eu. Du kannst dich außerdem bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere der Sächsischen Datenschutz- und Transparenzbeauftragten.',
      'Der Chat dient nicht der Bewertung von Personen, dem Profiling oder Entscheidungen mit rechtlicher beziehungsweise ähnlich erheblicher Wirkung. Die Bereitstellung personenbezogener Chat-Inhalte ist freiwillig und weder gesetzlich noch vertraglich vorgeschrieben.',
    ],
  },
] as const
