# Alternativen fuer Coolify auf Hetzner

## Stand auf staging

Vercel Speed Insights und Vercel Analytics waren auf diesem Branch bereits nicht
eingebunden. Der ungenutzte Vercel-Blob-Adapter und die Vercel-URL-Fallbacks wurden
entfernt. URLs werden ueber `NEXT_PUBLIC_SERVER_URL` konfiguriert (in Coolify beim
Build und zur Laufzeit setzen). Uploads verwenden bereits Payloads lokalen
Speicher im persistenten Volume `/app/media`.

Next.js bleibt als Anwendungsframework erhalten. Die ueber `next/font/google`
verwendete Geist-Mono-Schrift bleibt als beim Build heruntergeladene, lokal
ausgelieferte Schrift erhalten; sie benoetigt keinen Vercel-Dienst. Das ungenutzte
`geist`-npm-Paket wurde entfernt. Google Analytics wurde durch Umami ersetzt.
Die Anbindung ist vorbereitet; der Umami-Service muss noch eingerichtet werden.
Siehe [Umami in Coolify einrichten](umami-coolify.md).

## Empfehlungen

| Zweck | Empfehlung | Einsatz |
| --- | --- | --- |
| Besucher, Seitenaufrufe, Kampagnen und Events | [Umami](https://coolify.io/docs/services/umami) | Eigener Coolify-Service mit eigener Datenbank, z. B. unter `analytics.the-easycode.eu`. |
| Echte Nutzerperformance als Ersatz fuer Speed Insights | [Umami Performance ab 3.1](https://docs.umami.is/docs/performance) | Der vorbereitete Tracker aktiviert LCP, INP und CLS ueber `data-performance="true"`; Umami bietet dafuer ein Dashboard. |
| Automatische Performance-Checks | [sitespeed.io mit Lighthouse](https://www.sitespeed.io/documentation/sitespeed.io/lighthouse/) | Als separaten Docker-Job regelmaessig wichtige Seiten testen und Berichte speichern; Labormessungen ergaenzen echte Nutzerdaten. |
| Verfuegbarkeit und Ausfallmeldungen | [Uptime Kuma](https://coolify.io/docs/services/uptime-kuma) | HTTP-Checks und Benachrichtigungen; idealerweise auf einem zweiten Host, damit der Ausfall des Website-Servers erkannt wird. |
| Fehler und langsame Requests | [GlitchTip](https://glitchtip.com/documentation/performance/) | Optionaler eigener Dienst fuer Fehlerberichte und Performance-Tracing; SDK-Integration erforderlich. |
| Medien statt Vercel Blob | Persistentes Coolify-Volume, spaeter [Hetzner Object Storage](https://docs.hetzner.com/storage/object-storage/overview/) | Der Branch verwendet bereits ein Volume. S3-kompatibler Object Storage ist eine Option bei mehreren App-Instanzen; dafuer waere Payloads S3-Adapter separat zu konfigurieren. |

Meine Empfehlung fuer diese Website: Umami ab Version 3.1 und Uptime Kuma.
Umami uebernimmt Besucherstatistiken und echte Nutzerperformance. sitespeed.io
ist eine spaetere Ergaenzung fuer wiederholbare Performance-Pruefungen nach
Deployments.

## Umsetzung nach Auswahl

1. Dienste separat von der Website in Coolify anlegen, persistente Speicherung
   und Backups einrichten. Staging und Produktion getrennt erfassen.
2. Fuer Umami die eigene HTTPS-Skript-URL und Website-ID als Runtime-Variablen
   konfigurieren; siehe [Einrichtungsanleitung](umami-coolify.md). Die Google-
   Analytics-Komponente und ihre CookieBanner-Einbindung wurden entfernt.
3. Performance-Events ohne Query-Strings, Formulareingaben oder personenbezogene
   Inhalte senden und mit der vorhandenen Consent-Logik abstimmen.
4. Payload-Jobs koennen durch einen externen Scheduler ausgefuehrt werden. Der
   vorhandene Bearer-Header mit `CRON_SECRET` bleibt providerunabhaengig nutzbar;
   ohne eingerichteten Scheduler startet die Konfiguration allein keine Jobs.

Die bestehenden Medien aus dem alten Blob-Speicher muessen weiterhin separat
migriert werden; siehe [Deployment-Anleitung](deployment-coolify.md).
