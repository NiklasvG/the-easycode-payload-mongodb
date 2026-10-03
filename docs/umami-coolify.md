# Umami in Coolify einrichten

Die Website ersetzt Google Analytics durch selbst gehostetes Umami. Der Tracker
laedt erst nach Zustimmung zu "Nutzungsanalyse" im Cookie-Banner. Umami misst
Seitenaufrufe und SPA-Navigation automatisch. `data-performance="true"` aktiviert
ab Umami 3.1 auch Core Web Vitals und das Performance-Dashboard.

## 1. Eigenen Service anlegen

1. Lege einen DNS-A-Record fuer `analytics.the-easycode.eu` auf die oeffentliche
   IPv4-Adresse deines Hetzner-Servers an. Einen AAAA-Record nur setzen, wenn IPv6
   dort funktioniert.
2. Oeffne in Coolify dein Projekt und die gewuenschte Umgebung. Waehle **New
   Resource**, suche **Umami** und waehle den passenden Server / Destination.
3. Die Umami-Vorlage enthaelt Umami und eine separate PostgreSQL-Datenbank mit
   persistentem Volume. MongoDB der Website wird dafuer nicht verwendet.
4. Setze am Umami-Service die Domain `https://analytics.the-easycode.eu` fuer
   Container-Port `3000`. Die Datenbank bekommt keine oeffentliche Domain.
5. Behalte die von Coolify erzeugten Datenbank-Zugangsdaten und `APP_SECRET`.
   Pruefe das PostgreSQL-Volume und richte Datenbank-Backups ein.
6. Pruefe den Image-Tag in der Compose-Konfiguration: fuer das Performance-
   Dashboard ist **Umami >= 3.1** noetig. Die eingesehene Coolify-Vorlage verwendet
   noch `3.0.3`; falls das auch bei dir so ist, waehle vor dem ersten Start eine
   aktuelle stabile Version ab 3.1 aus dem offiziellen Umami-Registry. Einen
   konkreten Versions-Tag festhalten statt unkontrolliert `latest` zu verwenden.
7. Speichern und **Deploy**. Warte, bis Umami und PostgreSQL gesund sind, und
   oeffne deine Analytics-Domain ueber HTTPS.
8. Melde dich initial mit Benutzer `admin`, Passwort `umami` an und aendere das
   Passwort sofort.

## 2. Websites in Umami anlegen

Unter **Settings / Websites** eine Website hinzufuegen:

- Name: `EasyCode Staging`
- Domain: `staging.the-easycode.eu`

Oeffne die Einstellungen dieser Website und den **Tracking code**. Kopiere den
`src`-Wert des Skripts und die UUID aus `data-website-id`. Das Skript heisst
normalerweise `https://analytics.the-easycode.eu/script.js`; verwende den Wert
aus deiner Installation.

Fuer Produktion spaeter eine zweite Website mit `the-easycode.eu` anlegen und
deren eigene ID in der Produktions-App setzen. Dadurch vermischen sich die
Statistiken nicht.

## 3. Website-App konfigurieren

In Coolify bei der **EasyCode-Website-App**, nicht beim Umami-Service, unter
Environment Variables folgende Werte als **Runtime** setzen:

```dotenv
UMAMI_SCRIPT_URL=https://analytics.the-easycode.eu/script.js
UMAMI_WEBSITE_ID=DEINE-STAGING-WEBSITE-UUID
```

Speichern und die Website mit dem geaenderten Projekt deployen. Es sind keine
Build-Argumente noetig: das dynamische Server-Layout liest diese Variablen zur
Laufzeit und gibt sie an den Client weiter. URL und Website-ID sind oeffentliche
Tracker-Konfiguration, keine geheimen Zugangsdaten.

Fehlt einer der Werte, bleibt Umami deaktiviert. Lokal optional dieselben Werte
in `.env` setzen und den Entwicklungsserver neu starten. Fuer lokale Tests eine
separate Website-ID nutzen.

## 4. Funktion pruefen

1. Die Staging-Website in einem frischen Browserprofil oeffnen. Vor Zustimmung
   darf im Network-Tab kein Tracker-Skript von der Analytics-Domain geladen sein.
2. Nutzungsanalyse akzeptieren. Jetzt sollten das Skript und Requests an Umamis
   `/api/send` erscheinen; Seitenaufrufe sollten im Dashboard sichtbar werden.
3. Intern auf eine weitere Seite navigieren und deren Seitenaufruf pruefen.
4. Cookie-Einstellungen erneut oeffnen, Nutzungsanalyse deaktivieren und
   speichern. Weitere Navigationen duerfen keine neuen Tracking-Requests ausloesen.
   Ein bereits gestarteter Request kann noch abschliessen.
5. Im Performance-Tab nach echten Besuchen LCP, INP und CLS pruefen. Diese
   Browser-Messwerte erscheinen nicht notwendigerweise sofort; mit der Website
   interagieren und den Tab wechseln. Bei nachtraeglicher Zustimmung starten die
   Messungen erst mit dem Laden des Trackers.

Der Tracker respektiert Do Not Track und laesst Query-Strings und URL-Fragmente
weg. Browser mit Do Not Track oder Adblocker koennen daher keine Daten liefern.
Der `data-before-send`-Hook prueft die aktuelle Zustimmung vor jedem Versand,
auch wenn das bereits geladene Skript nach Widerruf weiter im Browser existiert.
Auch Aenderungen der Zustimmung in anderen Tabs werden beruecksichtigt.

Der Cookie-Banner wurde angepasst. Die im CMS gespeicherte Datenschutzseite
separat auf die tatsaechliche Umami-Nutzung aktualisieren.

## Offizielle Quellen

- [Coolify: Umami](https://coolify.io/docs/services/umami)
- [Coolify-Service-Vorlage](https://github.com/coollabsio/coolify/blob/main/templates/compose/umami.yaml)
- [Umami: Tracking code](https://docs.umami.is/docs/collect-data)
- [Umami: Tracker-Konfiguration](https://docs.umami.is/docs/tracker-configuration)
- [Umami: Performance ab 3.1](https://docs.umami.is/docs/performance)
